
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { getAuditLogs } from '@/functions/getAuditLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookUser, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const LogItem = ({ log }) => {
    const badgeColor = {
        create: 'bg-green-100 text-green-800',
        update: 'bg-blue-100 text-blue-800',
        delete: 'bg-red-100 text-red-800',
        read: 'bg-gray-100 text-gray-800',
    }[log.action] || 'bg-gray-100 text-gray-800';

    return (
        <div className="p-4 bg-[#111] rounded-lg border border-[#262626]">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Badge className={badgeColor}>{log.action}</Badge>
                        <p className="font-mono text-xs text-gray-400">{log.table_name}</p>
                    </div>
                    <p className="font-semibold text-white">{log.user_id}</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Target: <span className="font-medium text-gray-300">{log.record_id || 'N/A'}</span>
                    </p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                    {format(parseISO(log.created_date), 'MMM d, yyyy h:mm a')}
                </p>
            </div>
        </div>
    );
};

export default function AuditLogPanel() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { register, watch } = useForm({ defaultValues: { search: '' } });
    const searchQuery = watch('search');

    const fetchLogs = useCallback(async (query, pageNum) => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await getAuditLogs({ search: query, page: pageNum, limit: 10 });
            setLogs(data.logs);
            setPage(data.currentPage);
            setHasNextPage(data.hasNextPage);
        } catch (e) {
            setError('Failed to fetch audit logs.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchLogs(searchQuery, 1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery, fetchLogs]);
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1) {
            fetchLogs(searchQuery, newPage);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <BookUser className="w-6 h-6 text-[#00d4ff]" />
                Audit Logs
            </h2>
            <p className="text-gray-400 mb-6">Review a detailed log of all significant actions taken within your organization.</p>
            
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input {...register('search')} placeholder="Search by user, action, or target..." className="pl-10 bg-[#1a1a1a] border-[#3a3a3a]" />
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-[#1a1a1a]" />)
                ) : error ? (
                    <div className="text-center py-16 px-4 bg-[#1a1a1a] rounded-lg border border-dashed border-[#262626]">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : logs.length > 0 ? (
                    logs.map(log => <LogItem key={log.id} log={log} />)
                ) : (
                    <div className="text-center py-16 px-4 bg-[#1a1a1a] rounded-lg border border-dashed border-[#262626]">
                        <p className="text-gray-300">No logs found.</p>
                        <p className="text-sm text-gray-500">Try adjusting your search query or check back later.</p>
                    </div>
                )}
            </div>

            {(page > 1 || hasNextPage) && (
                <div className="flex justify-between items-center mt-6">
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    <span className="text-sm text-gray-400">Page {page}</span>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={!hasNextPage}>
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}
