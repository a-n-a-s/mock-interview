import Vapi from "@vapi-ai/web";


const publicKey = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
console.log("Vapi Public Key present:", !!publicKey);

export const vapi = new Vapi(publicKey!);
