@requires: 'authenticated-user'
service AIProxyService {

    type GPTTextResponse {
        text : String;
    }

    // @(requires: 'apiScope1')
    action callAICoreGPT(prompt : String) returns GPTTextResponse;
}

// test URL https://support-exp-process-innovate-amber-playground-api-proxy68edace3.cfapps.eu12.hana.ondemand.com/odata/v4/aiproxy/callAICoreGPT