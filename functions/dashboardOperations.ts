
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation, dashboard_id, widget_id, data } = await req.json();
    
    switch (operation) {
      case 'create_dashboard':
        return await createDashboard(base44, user, data);
      case 'update_dashboard':
        return await updateDashboard(base44, user, dashboard_id, data);
      case 'delete_dashboard':
        return await deleteDashboard(base44, user, dashboard_id);
      case 'add_widget':
        return await addWidget(base44, user, dashboard_id, data);
      case 'update_widget':
        // Changed call signature: passing dashboard_id instead of user, matching new function signature
        return await updateWidget(base44, dashboard_id, widget_id, data);
      case 'delete_widget':
        // Changed call signature: passing dashboard_id instead of user, matching new function signature
        return await deleteWidget(base44, dashboard_id, widget_id);
      case 'get_dashboard_data':
        return await getDashboardData(base44, user, dashboard_id);
      case 'duplicate_dashboard':
        return await duplicateDashboard(base44, user, dashboard_id, data);
      default:
        return Response.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Dashboard operation failed:', error);
    return Response.json({ 
      error: 'Dashboard operation failed', 
      details: error.message 
    }, { status: 500 });
  }
});

async function createDashboard(base44, user, data) {
  const { name, description, org_id, workspace_id, is_public = false } = data;
  
  // Verify user has access to create dashboards in this workspace
  const orgUsers = await base44.entities.OrgUser.filter({ org_id, user_email: user.email });
  if (orgUsers.length === 0) {
    return Response.json({ error: 'Access denied to organization' }, { status: 403 });
  }
  
  // Only owners and admins can create public dashboards
  const userRole = orgUsers[0].role;
  if (is_public && !['owner', 'admin'].includes(userRole)) {
    return Response.json({ error: 'Insufficient permissions to create public dashboard' }, { status: 403 });
  }
  
  const dashboard = await base44.entities.Dashboard.create({
    name,
    description,
    org_id,
    workspace_id,
    is_public,
    layout_config: {
      columns: 12,
      row_height: 150,
      margin: [10, 10]
    }
  });
  
  // Log the action
  await base44.entities.SystemEvent.create({
    org_id,
    workspace_id,
    actor_type: 'user',
    actor_id: user.email,
    event_type: 'admin_action',
    severity: 'info',
    payload: {
      action: 'dashboard_created',
      dashboard_id: dashboard.id,
      dashboard_name: name
    },
    timestamp: new Date().toISOString()
  });
  
  return Response.json({ success: true, dashboard });
}

async function updateDashboard(base44, user, dashboard_id, data) {
  // Get existing dashboard to verify permissions
  const dashboards = await base44.entities.Dashboard.filter({ id: dashboard_id });
  if (dashboards.length === 0) {
    return Response.json({ error: 'Dashboard not found' }, { status: 404 });
  }
  
  const dashboard = dashboards[0];
  
  // Check if user can edit this dashboard
  if (dashboard.created_by !== user.email) {
    const orgUsers = await base44.entities.OrgUser.filter({ 
      org_id: dashboard.org_id, 
      user_email: user.email 
    });
    if (orgUsers.length === 0 || !['owner', 'admin'].includes(orgUsers[0].role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
  }
  
  const updatedDashboard = await base44.entities.Dashboard.update(dashboard_id, data);
  
  // Log the action
  await base44.entities.SystemEvent.create({
    org_id: dashboard.org_id,
    workspace_id: dashboard.workspace_id,
    actor_type: 'user',
    actor_id: user.email,
    event_type: 'admin_action',
    severity: 'info',
    payload: {
      action: 'dashboard_updated',
      dashboard_id: dashboard_id,
      changes: Object.keys(data)
    },
    timestamp: new Date().toISOString()
  });
  
  return Response.json({ success: true, dashboard: updatedDashboard });
}

async function deleteDashboard(base44, user, dashboard_id) {
  const dashboards = await base44.entities.Dashboard.filter({ id: dashboard_id });
  if (dashboards.length === 0) {
    return Response.json({ error: 'Dashboard not found' }, { status: 404 });
  }
  
  const dashboard = dashboards[0];
  
  // Check permissions
  if (dashboard.created_by !== user.email) {
    const orgUsers = await base44.entities.OrgUser.filter({ 
      org_id: dashboard.org_id, 
      user_email: user.email 
    });
    if (orgUsers.length === 0 || !['owner', 'admin'].includes(orgUsers[0].role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
  }
  
  // Delete all widgets first
  const widgets = await base44.entities.DashboardWidget.filter({ dashboard_id });
  for (const widget of widgets) {
    await base44.entities.DashboardWidget.delete(widget.id);
  }
  
  // Delete dashboard
  await base44.entities.Dashboard.delete(dashboard_id);
  
  // Log the action
  await base44.entities.SystemEvent.create({
    org_id: dashboard.org_id,
    workspace_id: dashboard.workspace_id,
    actor_type: 'user',
    actor_id: user.email,
    event_type: 'admin_action',
    severity: 'info',
    payload: {
      action: 'dashboard_deleted',
      dashboard_id: dashboard_id,
      dashboard_name: dashboard.name,
      widgets_deleted: widgets.length
    },
    timestamp: new Date().toISOString()
  });
  
  return Response.json({ success: true });
}

async function addWidget(base44, user, dashboard_id, widgetData) {
  const widget = await base44.entities.DashboardWidget.create({
    dashboard_id,
    ...widgetData
  });
  
  return Response.json({ success: true, widget });
}

// Changed signature: user removed, dashboard_id added
async function updateWidget(base44, dashboard_id, widget_id, data) {
  const updatedWidget = await base44.entities.DashboardWidget.update(widget_id, data);
  return Response.json({ success: true, widget: updatedWidget });
}

// Changed signature: user removed, dashboard_id added
async function deleteWidget(base44, dashboard_id, widget_id) {
  await base44.entities.DashboardWidget.delete(widget_id);
  return Response.json({ success: true });
}

async function getDashboardData(base44, user, dashboard_id) {
  // Get dashboard and its widgets
  const dashboards = await base44.entities.Dashboard.filter({ id: dashboard_id });
  if (dashboards.length === 0) {
    return Response.json({ error: 'Dashboard not found' }, { status: 404 });
  }
  
  const dashboard = dashboards[0];
  const widgets = await base44.entities.DashboardWidget.filter({ dashboard_id });
  
  // Fetch data for each widget
  const widgetData = {};
  
  for (const widget of widgets) {
    try {
      if (widget.kind === 'timeseries' || widget.kind === 'kpi') {
        // Removed group_by from destructuring as it's not used here
        const { metric_name, time_window_hours = 24, filters = {} } = widget.query; 
        
        const timeAgo = new Date(Date.now() - time_window_hours * 60 * 60 * 1000).toISOString();
        
        const metrics = await base44.entities.MetricsHour.filter({
          metric_name,
          timestamp: { '$gte': timeAgo },
          org_id: dashboard.org_id,
          workspace_id: dashboard.workspace_id,
          ...filters
        });
        
        widgetData[widget.id] = {
          type: widget.kind,
          data: metrics,
          widget_config: widget
        };
      }
      
      else if (widget.kind === 'table') {
        const { table_source, columns = [], limit = 100, filters = {} } = widget.query;
        
        let tableData = [];
        if (table_source === 'system_events') {
          tableData = await base44.entities.SystemEvent.filter({
            org_id: dashboard.org_id,
            workspace_id: dashboard.workspace_id,
            ...filters
          }, null, limit);
        } else if (table_source === 'access_logs') {
          tableData = await base44.entities.AccessLog.filter({
            org_id: dashboard.org_id,
            ...filters
          }, null, limit);
        }
        
        widgetData[widget.id] = {
          type: 'table',
          data: tableData,
          columns: columns.length > 0 ? columns : Object.keys(tableData[0] || {}),
          widget_config: widget
        };
      }
      
      else if (widget.kind === 'markdown') {
        widgetData[widget.id] = {
          type: 'markdown',
          content: widget.content.markdown || '',
          widget_config: widget
        };
      }
    } catch (error) {
      console.error(`Failed to load data for widget ${widget.id}:`, error);
      widgetData[widget.id] = {
        type: 'error',
        error: error.message,
        widget_config: widget
      };
    }
  }
  
  return Response.json({
    success: true,
    dashboard,
    widgets,
    data: widgetData
  });
}

async function duplicateDashboard(base44, user, dashboard_id, { name }) {
  const dashboards = await base44.entities.Dashboard.filter({ id: dashboard_id });
  if (dashboards.length === 0) {
    return Response.json({ error: 'Dashboard not found' }, { status: 404 });
  }
  
  const originalDashboard = dashboards[0];
  const widgets = await base44.entities.DashboardWidget.filter({ dashboard_id });
  
  // Create new dashboard
  const newDashboard = await base44.entities.Dashboard.create({
    name: name || `${originalDashboard.name} (Copy)`,
    description: originalDashboard.description,
    org_id: originalDashboard.org_id,
    workspace_id: originalDashboard.workspace_id,
    is_public: false, // Copies are private by default
    layout_config: originalDashboard.layout_config
  });
  
  // Duplicate all widgets
  for (const widget of widgets) {
    await base44.entities.DashboardWidget.create({
      dashboard_id: newDashboard.id,
      kind: widget.kind,
      title: widget.title,
      query: widget.query,
      layout: widget.layout,
      content: widget.content
    });
  }
  
  return Response.json({ success: true, dashboard: newDashboard });
}
