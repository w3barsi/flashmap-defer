export const maxDuration = 240

export const POST = async () => {
  await new Promise((resolve) => setTimeout(resolve, 20000));

  return Response.json({"status": "success"})
};
