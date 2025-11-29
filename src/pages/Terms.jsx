
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle, Shield, Zap, Users, Eye, FileText, Gavel } from "lucide-react";

export default function Terms() {
  const lastUpdated = "December 21, 2024";
  const effectiveDate = "December 21, 2024";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Badge className="bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/30 mb-4">
            <Scale className="w-3 h-3 mr-1" />
            Terms of Service
          </Badge>
          <h1 className="text-4xl font-bold mb-2">knXw Terms of Service</h1>
          <div className="flex gap-4 text-sm text-[#a3a3a3]">
            <span>Last updated: {lastUpdated}</span>
            <span>•</span>
            <span>Effective: {effectiveDate}</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Legal Agreement Notice */}
          <Card className="bg-[#111111] border-[#ef4444]/30">
            <CardHeader className="p-6">
              <CardTitle className="text-[#ef4444] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Binding Legal Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-[#e5e5e5] leading-relaxed">
                These Terms of Service constitute a legally binding agreement between you and knXw Inc. governing your use of psychographic analytics services. 
                By accessing or using knXw, you agree to comply with all terms and acknowledge the serious legal and ethical responsibilities associated with psychological profiling technology.
                <strong className="text-[#ef4444]"> Violation of these terms may result in immediate termination and legal action.</strong>
              </p>
            </CardContent>
          </Card>

          {/* Acceptance and Authority */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#00d4ff]" />
                1. Agreement Acceptance & Authority
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Individual Users:</h3>
                <p>By using knXw, you represent that you are at least 18 years old, have the legal capacity to enter contracts, and agree to be bound by these Terms.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Organizational Users:</h3>
                <p>If using knXw on behalf of an organization, you represent and warrant that:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>You have authority to bind the organization to these Terms</li>
                  <li>The organization will comply with all applicable laws and regulations</li>
                  <li>You will ensure all organization members using knXw comply with these Terms</li>
                  <li>The organization accepts full liability for all activities under your account</li>
                </ul>
              </div>

              <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4">
                <h4 className="font-semibold text-[#00d4ff] mb-2">Legal Entity:</h4>
                <p className="text-sm">References to "you" include both individual users and the organizations they represent. Both are jointly and severally liable for compliance.</p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use Policy */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00d4ff]" />
                2. Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Permitted Uses:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Improving user experience through personalized content and interfaces</li>
                  <li>Optimizing marketing messages and timing based on psychographic insights</li>
                  <li>Conducting market research and customer segmentation analysis</li>
                  <li>A/B testing and conversion rate optimization</li>
                  <li>Customer support optimization and resource allocation</li>
                  <li>Product development informed by user personality insights</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#ef4444] mb-2">STRICTLY PROHIBITED:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Manipulative Targeting:</strong> Using psychological vulnerabilities to pressure users into harmful decisions, exploit emotional distress, or encourage addictive behaviors</li>
                  <li><strong>Discriminatory Practices:</strong> Denying services, employment, housing, credit, or insurance based on inferred psychological traits or creating unfair disparities in pricing or access</li>
                  <li><strong>Political Manipulation:</strong> Using psychographic data for voter suppression, election interference, or spreading targeted disinformation</li>
                  <li><strong>Surveillance & Stalking:</strong> Using insights to monitor, harass, or intimidate individuals or groups</li>
                  <li><strong>Identity Inference:</strong> Attempting to identify anonymous users or linking psychographic profiles to personally identifiable information without explicit consent</li>
                  <li><strong>Children's Data:</strong> Processing psychological data of individuals under 16 (or applicable age of consent)</li>
                  <li><strong>Sensitive Categories:</strong> Inferring or targeting based on protected characteristics (race, religion, health status, political views, sexual orientation) without explicit consent and lawful basis</li>
                  <li><strong>Harmful Content:</strong> Promoting violence, hate speech, illegal activities, or self-harm</li>
                </ul>
              </div>

              <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4">
                <h4 className="font-semibold text-[#ef4444] mb-2">Zero Tolerance:</h4>
                <p className="text-sm">Violations of prohibited uses will result in immediate account suspension, data deletion, and potential legal action. We actively monitor for misuse and maintain the right to audit customer implementations.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Responsibilities */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00d4ff]" />
                3. Data Responsibilities & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Customer Obligations:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Legal Compliance:</strong> Ensure all data collection and use complies with applicable laws (GDPR, CCPA, PIPEDA, etc.)</li>
                  <li><strong>Consent Management:</strong> Obtain appropriate consents for behavioral tracking and psychological profiling</li>
                  <li><strong>Transparency:</strong> Provide clear, comprehensive privacy notices explaining psychographic analysis</li>
                  <li><strong>User Rights:</strong> Honor data subject requests for access, deletion, and portability</li>
                  <li><strong>Data Quality:</strong> Ensure submitted data is accurate, relevant, and lawfully collected</li>
                  <li><strong>Security:</strong> Implement appropriate safeguards for data in transit and at rest</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Data Controller Responsibilities:</h3>
                <p>As Data Controller, you are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Determining purposes and means of processing</li>
                  <li>Ensuring lawful basis for all processing activities</li>
                  <li>Conducting Data Protection Impact Assessments (DPIAs) where required</li>
                  <li>Maintaining records of processing activities</li>
                  <li>Appointing Data Protection Officers where legally required</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">knXw as Data Processor:</h3>
                <p>When processing customer data, knXw commits to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Process data only according to documented customer instructions</li>
                  <li>Maintain appropriate technical and organizational measures</li>
                  <li>Assist with data subject requests and compliance obligations</li>
                  <li>Notify customers of data breaches within 24 hours</li>
                  <li>Delete or return data upon contract termination</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00d4ff]" />
                4. Account Management & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Account Security:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You are responsible for maintaining account credentials security</li>
                  <li>All activities under your account are your responsibility</li>
                  <li>Enable multi-factor authentication when available</li>
                  <li>Notify us immediately of suspected unauthorized access</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Access Controls:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Implement principle of least privilege for team members</li>
                  <li>Regularly review and revoke unnecessary access permissions</li>
                  <li>Maintain accurate user role assignments</li>
                  <li>Monitor access logs and unusual activity patterns</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Terms */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">5. Subscriptions & Billing</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Subscription Tiers:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Developer:</strong> Basic psychographic profiling with credit limits</li>
                  <li><strong>Growth:</strong> Advanced profiling with increased limits</li>
                  <li><strong>Pro:</strong> Full feature access with high-volume processing</li>
                  <li><strong>Enterprise:</strong> Custom solutions with dedicated support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Billing Terms:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Subscriptions renew automatically unless cancelled</li>
                  <li>Usage-based charges apply for credit overages</li>
                  <li>Payment due upon invoice date via authorized payment method</li>
                  <li>Late payments may result in service suspension</li>
                  <li>All fees are non-refundable except as required by law</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Fair Use Policy:</h3>
                <p>Usage must be reasonable and consistent with your subscription tier. Excessive usage may result in additional charges or service limitations.</p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">knXw Platform:</h3>
                <p>All platform software, algorithms, documentation, and related intellectual property are owned by knXw and protected by copyright, patent, and trade secret laws.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Customer Data:</h3>
                <p>You retain ownership of all data submitted to knXw. You grant knXw a limited license to process this data solely for service delivery and improvement.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Derived Insights:</h3>
                <p>Psychographic profiles and insights generated from your data remain your property. knXw may use aggregated, anonymized insights to improve the platform.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Feedback License:</h3>
                <p>Feedback provided to knXw becomes our property and may be used for any purpose without compensation or attribution.</p>
              </div>
            </CardContent>
          </Card>

          {/* Warranties and Disclaimers */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">7. Warranties & Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Service Warranty:</h3>
                <p>knXw warrants that services will be performed in accordance with documented specifications and industry standards. We maintain 99.9% uptime SLA for paid accounts.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Accuracy Disclaimer:</h3>
                <p className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-4">
                  <strong className="text-[#fbbf24]">IMPORTANT:</strong> Psychographic insights are probabilistic assessments based on behavioral patterns. 
                  knXw does not guarantee accuracy of personality assessments or predictions. Results should be used as one factor in decision-making, not the sole determinant.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Legal Disclaimer:</h3>
                <p className="text-sm uppercase tracking-wide">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, KNXW DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, 
                  FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-[#111111] border-[#ef4444]/30">
            <CardHeader className="p-6">
              <CardTitle className="text-[#ef4444]">8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4">
                <p className="text-sm uppercase tracking-wide font-semibold text-[#ef4444] mb-2">
                  CRITICAL LIABILITY LIMITATIONS:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>KNXW'S TOTAL LIABILITY FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO KNXW IN THE 12 MONTHS PRECEDING THE CLAIM</li>
                  <li>KNXW SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                  <li>NO LIABILITY FOR LOSS OF PROFITS, REVENUE, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL</li>
                  <li>LIABILITY LIMITATIONS APPLY REGARDLESS OF LEGAL THEORY (CONTRACT, TORT, STRICT LIABILITY)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Customer Indemnification:</h3>
                <p>You agree to indemnify knXw against claims arising from:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Your use of the service in violation of these Terms</li>
                  <li>Violation of applicable laws or third-party rights</li>
                  <li>Your data or content submitted to the platform</li>
                  <li>Claims by your end-users regarding psychographic profiling</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Termination for Cause:</h3>
                <p>Either party may terminate immediately for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Material breach not cured within 30 days of written notice</li>
                  <li>Violation of Acceptable Use Policy</li>
                  <li>Insolvency or bankruptcy proceedings</li>
                  <li>Failure to pay undisputed charges within 60 days</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Termination for Convenience:</h3>
                <p>You may cancel your subscription at any time. We may terminate free accounts with 30 days notice.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Effect of Termination:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Service access terminates immediately</li>
                  <li>Customer data will be deleted after 90-day retention period</li>
                  <li>Outstanding fees remain payable</li>
                  <li>Survival provisions remain in effect</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">10. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Negotiation:</h3>
                <p>Parties will attempt good faith negotiation for 30 days before initiating formal proceedings.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Arbitration:</h3>
                <p>For disputes exceeding $10,000, binding arbitration under AAA Commercial Rules. Location: jurisdiction of knXw's principal place of business.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Governing Law:</h3>
                <p>These Terms are governed by Delaware law, excluding conflict of law principles. Courts in Delaware have exclusive jurisdiction over non-arbitrable disputes.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Class Action Waiver:</h3>
                <p>All disputes must be brought individually. No class actions, collective actions, or representative proceedings.</p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Monitoring */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#00d4ff]" />
                11. Compliance Monitoring & Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Proactive Monitoring:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Automated detection of potentially harmful use patterns</li>
                  <li>Regular audit of high-risk customer implementations</li>
                  <li>Machine learning models to identify policy violations</li>
                  <li>Review of engagement rules and targeting criteria</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Reporting Mechanisms:</h3>
                <p>Report suspected misuse to <a href="mailto:abuse@knxw.app" className="text-[#00d4ff] hover:underline">abuse@knxw.app</a>. 
                We investigate all reports and take appropriate action within 48 hours.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Enforcement Actions:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Warning notices for first-time minor violations</li>
                  <li>Feature restrictions for moderate violations</li>
                  <li>Account suspension for serious violations</li>
                  <li>Permanent termination for severe or repeated violations</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Appeals Process:</h3>
                <p>Customers may appeal enforcement actions within 30 days. Appeals are reviewed by independent compliance committee.</p>
              </div>
            </CardContent>
          </Card>

          {/* General Provisions */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">12. General Provisions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Entire Agreement:</h3>
                <p>These Terms, Privacy Policy, and any executed agreements constitute the complete agreement between parties.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Modifications:</h3>
                <p>We may modify these Terms with 30 days advance notice. Material changes require explicit acceptance. Continued use constitutes agreement to modifications.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Severability:</h3>
                <p>If any provision is unenforceable, the remainder remains in full force and effect.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Assignment:</h3>
                <p>You may not assign these Terms without written consent. knXw may assign to affiliates or in connection with mergers/acquisitions.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Force Majeure:</h3>
                <p>Neither party liable for delays due to circumstances beyond reasonable control.</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-[#111111] border-[#00d4ff]/30">
            <CardHeader className="p-6">
              <CardTitle className="text-[#00d4ff]">13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-[#e5e5e5] leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Legal Entity:</h3>
                <p>knXw Inc.<br/>
                Delaware Corporation</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Contact Information:</h3>
                <ul className="space-y-1">
                  <li><strong>General:</strong> <a href="mailto:travis@knxw.app" className="text-[#00d4ff] hover:underline">travis@knxw.app</a></li>
                  <li><strong>Legal/Compliance:</strong> <a href="mailto:legal@knxw.app" className="text-[#00d4ff] hover:underline">legal@knxw.app</a></li>
                  <li><strong>Abuse Reports:</strong> <a href="mailto:abuse@knxw.app" className="text-[#00d4ff] hover:underline">abuse@knxw.app</a></li>
                  <li><strong>Data Protection:</strong> <a href="mailto:dpo@knxw.app" className="text-[#00d4ff] hover:underline">dpo@knxw.app</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Emergency Contacts:</h3>
                <p>For urgent security or compliance matters requiring immediate attention, use subject line "URGENT - [Issue Type]" when contacting the appropriate email above.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Disclaimer Section */}
        <section className="py-12 border-t border-[#262626]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Performance Estimates and Disclaimers</h2>
            <div className="bg-[#111111]/50 border border-[#262626] rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#00d4ff] mb-3">Important Disclaimers</h3>
                <div className="text-sm text-[#a3a3a3] leading-relaxed space-y-3">
                  <p>
                    <strong className="text-[#e5e5e5]">Performance Estimates:</strong> All percentage improvements, metrics, and performance claims shown throughout our platform and marketing materials are estimates based on limited case studies, theoretical models, or industry benchmarks. Individual results may vary significantly.
                  </p>
                  <p>
                    <strong className="text-[#e5e5e5]">Success Not Guaranteed:</strong> Past performance does not guarantee future results. Success with knXw depends on numerous factors including but not limited to: implementation quality, data accuracy, user behavior patterns, market conditions, competitive landscape, and proper platform usage.
                  </p>
                  <p>
                    <strong className="text-[#e5e5e5]">No Warranty:</strong> knXw makes no warranties, express or implied, regarding specific outcomes, ROI improvements, or business results. Users should conduct their own analysis and testing to evaluate platform effectiveness for their specific use case.
                  </p>
                  <p>
                    <strong className="text-[#e5e5e5]">Professional Consultation:</strong> This platform is provided "as is" without warranty of any kind. Please consult with your legal and financial advisors before making business decisions based on platform insights or recommendations.
                  </p>
                  <p>
                    <strong className="text-[#e5e5e5]">Results Dependency:</strong> Any success metrics or improvements achieved through use of our platform are heavily dependent on factors outside our control, including but not limited to user engagement with recommendations, market timing, competitive responses, and implementation quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
