exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  };
};
