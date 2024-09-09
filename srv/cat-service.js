import cds from "@sap/cds";

// handler for ai-service.cds
export class AIProxyService extends cds.ApplicationService {
    /**
     * Define handlers for CAP actions
     */
    async init() {
        await super.init();
        this.on("callAICoreGPT", this.aiProxyAction1);
    }

    /**
     * Action forwarding prompt to AI inferencing services through SAP AI Core provided proxy
     *
     * @param {Request} req
     * @returns GPTTextResponse { text : string }
     */
    aiProxyAction1 = async (req) => {
        const { prompt } = req.data;
        const response = await this.callAIProxy(prompt);
        return { text: response["choices"][0].message.content };
    };

    /**
     * Forwards prompt of the payload via a destination (mapped as AICoreLLMDestination) through an SAP AI Core deployed service to Azure OpenAI services
     *
     * @param {string} prompt
     * @returns raw response from Azure OpenAI services for Completions
     */
    callAIProxy = async (prompt) => {
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
    };
}
