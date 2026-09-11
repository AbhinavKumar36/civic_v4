export const pipeline = jest.fn().mockResolvedValue(
  jest.fn().mockResolvedValue({ data: new Float32Array([1, 0, 0]) })
);
export const env = { allowLocalModels: false };
