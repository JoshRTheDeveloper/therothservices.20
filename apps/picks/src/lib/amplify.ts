import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);

export function hasPickModel(): boolean {
  const models = outputs.data?.model_introspection?.models;
  return Boolean(models && "Pick" in models);
}
