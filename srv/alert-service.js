import {
    AlertNotificationClient,
    EntityType,
    BasicAuthentication,
    RegionUtils,
    State
} from '@sap_oss/alert-notification-client';
import { OpenApiRequestBuilder } from '@sap-cloud-sdk/openapi';
import cds from "@sap/cds";

export class AIProxyService extends cds.ApplicationService{
     /**
     * Define handlers for CAP actions
     */
     async init() {
        await super.init();
        this.on("connectAlertService", this.aiProxyAction2);

        callAIProxy = async (prompt) => {
            try {
                const openai = await cds.connect.to("AICoreLLMDestination");
                const payload = {
                    messages: [
                        { role: "user", content: prompt }
                    ]
                };
                
                const response = await openai.send({
                    query: "POST /chat/completions?api-version=2023-05-15",
                    data: payload
                });
                
                return response;
                
            } catch (error) {
                console.error('Error in callAIProxy:', error.message);
                await connectAlertService(error.message);
            }
        }
    }

    /**
     * 
     * Timed access to ports, sends alerts if access fails
     */
    aiProxyAction2 = async (req) => {
        setInterval(callAIProxy(req.data), 60 * 60 * 1000);
    };

    /**
     * Send alerts to alert notification service in BTP
     *
     * @param {string} prompt
     * @returns raw response from Azure OpenAI services for Completions
     */
    connectAlertService = async (prompt) => {
        try {
            // request body
            const alertPayload = {
                body: 'Port cannot accessed.',
                subject: {prompt},
                eventType: 'audit.app.stop',
                severity: Severity.WARNING,
                category: Category.ALERT,
                resource: {
                    resourceName: 'test-resource',
                    resourceType: 'application',
                    resourceInstance: '123456',
                    tags: {
                        detailsLink: 'https://example.details.com'
                    }
                },
                eventTimestamp: 1602787032,
                priority: 1
            };
    
            //Alert Notification API Configurition
            const alertConfig = {
                alertApiUrl : 'https://<btp-alert-notification-url>/cf/producer/v1/resource-events', // BTP Alert Notification URL
                username : 'username@sap.com',
                password : 'password',
                region : 'e.g. eu10'
            }
    
            const headers = {
                'Authorization': `Bearer ${apiKey}`, 
                'Content-Type': 'application/json'
            };
    
            // Send POST to Alert Notification API
            const alertResponse = await fetch(alertApiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(alertPayload)
            });
    
            if (alertResponse.ok) {
                console.log('Alert sent to BTP successfully.');
            } else {
                console.error('Failed to send alert to BTP:', alertResponse.statusText);
            }
    
        } catch (error) {
            console.error('Error sending alert to BTP:', error.message);
        }
    };

    
   
}

