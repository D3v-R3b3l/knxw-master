
import React from 'react';
import DocSection from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function AttributionDoc() {
  return (
    <div>
      <DocSection title="ROI Attribution & Ad Feedback" id="attribution-intro">
        <p>
          The ROI Attribution & Ad Feedback system is one of the most powerful features in knXw. It bridges the gap between user behavior on your website and the ad spend that brought them there. This system allows you to deterministically attribute conversions to their true source and feed this data back to ad platforms like Meta (Facebook/Instagram) and Google to optimize your campaigns automatically.
        </p>
        <Callout type="warning" title="Subscription Requirement">
          This is an advanced feature set. Full access to the ROI Attribution & Ad Feedback system requires a **Growth Plan or higher**.
        </Callout>
      </DocSection>

      <DocSection title="The Core Concepts" id="attribution-concepts">
        <p>To understand attribution, you need to grasp these three core concepts:</p>
        <ol>
          <li><strong>Workspaces:</strong> A Workspace is a container for a specific business or project. It holds all the configuration, secrets, and domains for one complete attribution setup. You might have one workspace for your main e-commerce site and another for a separate marketing landing page.</li>
          <li><strong>Secrets:</strong> These are your encrypted API keys and access tokens for ad platforms. knXw stores these securely and uses them to send conversion data on your behalf. We never expose these secrets on the client-side.</li>
          <li><strong>Authorized Domains:</strong> This is a security measure. You must explicitly list the domains (e.g., `https://www.yourshop.com`) that are allowed to use a workspace's configuration. This prevents unauthorized use of your tracking setup.</li>
        </ol>
      </DocSection>
      
      <DocSection title="Step-by-Step Setup Guide" id="attribution-setup">
        <p>
          Follow these steps in order on the <a href="/AttributionSettings">Attribution Settings</a> page.
        </p>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Step 1: Create a Workspace</h3>
        <p>
          Everything starts with a workspace.
        </p>
        <ol>
            <li>Navigate to the "Workspaces" card.</li>
            <li>Click "Create New Workspace".</li>
            <li>Give it a descriptive name (e.g., "Main Production Site").</li>
            <li>Set a default timezone. This is crucial for accurate reporting.</li>
            <li>Click "Create". Your new workspace will appear in the list. Select it to proceed.</li>
        </ol>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Step 2: Add Ad Platform Secrets</h3>
        <p>
          With your workspace selected, move to the "Ad Platform Secrets" card. You only need to fill in the platforms you use.
        </p>
        <ul>
            <li><strong>For Meta (Facebook/Instagram):</strong> You need your Pixel ID and a Conversions API (CAPI) Access Token.</li>
            <li><strong>For Google Ads & GA4:</strong> You need your Google Ads Customer ID, Developer Token, GA4 Measurement ID, and GA4 API Secret.</li>
        </ul>
        <Callout type="info" title="Where to find these keys?">
          Each input field has a placeholder and description guiding you where to find these values within your Meta Business Manager or Google Ads/Analytics accounts.
        </Callout>
        <p>
          After entering your secrets, click "Save Secrets". They will be encrypted and stored securely.
        </p>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Step 3: Authorize Your Domain(s)</h3>
        <p>
          In the "Authorized Domains" card, add the full origin of the website where you will place the tracking snippet.
        </p>
        <ul>
          <li><strong>Correct format:</strong> `https://www.yourwebsite.com`</li>
          <li><strong>Incorrect format:</strong> `yourwebsite.com` or `www.yourwebsite.com`</li>
        </ul>
        <p>
          You can add multiple domains (e.g., for different international sites or landing pages) to the same workspace.
        </p>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Step 4: Generate and Install the SDK Snippet</h3>
        <p>
          This is the final step. In the "Attribution SDK Snippet" card:
        </p>
        <ol>
          <li>Ensure your desired workspace is selected from the dropdown.</li>
          <li>The "Authorized Origin" field should automatically populate with your current site's origin, but you can change it to match the domain you authorized in Step 3.</li>
          <li>Click "Generate Snippet".</li>
          <li>A unique JavaScript snippet will be generated. Copy it.</li>
          <li>
            Paste this snippet into the <code>&lt;head&gt;</code> section of your website, on every page you want to track. If you're using a CMS like WordPress or a tag manager like Google Tag Manager, add it there.
          </li>
        </ol>
        <Callout type="success" title="Setup Complete!">
          Once the snippet is installed on your site, knXw will begin tracking user journeys, capturing attribution data, and sending conversion events back to your ad platforms. You should see data appearing in the Event Stream and your ad platforms within a few hours.
        </Callout>
      </DocSection>
    </div>
  );
}
