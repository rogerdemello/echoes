import { AzureOpenAI } from "openai";

export function getChatClient(): {
  client: AzureOpenAI;
  model: string;
} | null {
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  if (!azureKey || !azureEndpoint || !azureDeployment) {
    return null;
  }

  return {
    client: new AzureOpenAI({
      apiKey: azureKey,
      endpoint: azureEndpoint.replace(/\/$/, ""),
      apiVersion:
        process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview",
      deployment: azureDeployment,
    }),
    model: azureDeployment,
  };
}

export function getWhisperClient(): AzureOpenAI | null {
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const whisperDeployment =
    process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME ??
    process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT;

  if (!azureKey || !azureEndpoint || !whisperDeployment) {
    return null;
  }

  return new AzureOpenAI({
    apiKey: azureKey,
    endpoint: azureEndpoint.replace(/\/$/, ""),
    apiVersion:
      process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview",
    deployment: whisperDeployment,
  });
}

export function getWhisperModel(): string {
  return (
    process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT_NAME ??
    process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT ??
    "whisper"
  );
}
