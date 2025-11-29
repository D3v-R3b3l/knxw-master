
import React, { useState, useEffect, useCallback } from 'react';
import { abTestManager } from "@/functions/abTestManager";

// Hook to handle A/B test assignment and conversion tracking
export function useABTest(testId, userId, clientAppId) {
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    const assignVariant = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await abTestManager({
                action: 'assign_variant',
                ab_test_id: testId,
                user_id: userId,
                client_app_id: clientAppId
            });
            
            if (data.assigned) {
                setAssignment(data);
            }
        } catch (error) {
            console.error('Error assigning A/B test variant:', error);
        } finally {
            setLoading(false);
        }
    }, [testId, userId, clientAppId]); // Dependencies for useCallback

    useEffect(() => {
        if (testId && userId && clientAppId) {
            assignVariant();
        }
    }, [testId, userId, clientAppId, assignVariant]); // Add assignVariant to useEffect dependencies

    const recordConversion = useCallback(async (metricName, eventType, value = 1) => {
        if (!assignment) {
            console.warn('Attempted to record conversion before variant assignment.');
            return;
        }

        try {
            await abTestManager({
                action: 'record_conversion',
                ab_test_id: testId,
                user_id: userId,
                metric_name: metricName,
                event_type: eventType,
                value,
                variant_name: assignment.variant_name // Include variant_name for conversion tracking
            });
        } catch (error) {
            console.error('Error recording A/B test conversion:', error);
        }
    }, [assignment, testId, userId]); // Dependencies for useCallback

    return {
        assignment,
        loading,
        recordConversion,
        isInTest: !!assignment
    };
}

// Component to render different variants based on A/B test assignment
export function ABTestVariant({ testId, userId, clientAppId, variants, fallback = null }) {
    const { assignment, loading } = useABTest(testId, userId, clientAppId);

    if (loading) {
        return fallback;
    }

    if (!assignment) {
        return fallback;
    }

    // Find the matching variant component
    const variantComponent = variants[assignment.variant_name] || variants[assignment.variant_id];
    
    if (variantComponent) {
        return React.cloneElement(variantComponent, {
            ...variantComponent.props,
            abTestData: assignment
        });
    }

    return fallback;
}

// Higher-order component for A/B testing integration
export function withABTesting(WrappedComponent, testConfig) {
    return function ABTestWrapper(props) {
        const { testId, userId, clientAppId } = testConfig;
        const { assignment, loading, recordConversion } = useABTest(testId, userId, clientAppId);

        if (loading) {
            return <WrappedComponent {...props} abTestLoading={true} />;
        }

        return (
            <WrappedComponent
                {...props}
                abTestAssignment={assignment}
                recordABConversion={recordConversion}
                isInABTest={!!assignment}
            />
        );
    };
}

export default {
    useABTest,
    ABTestVariant,
    withABTesting
};
