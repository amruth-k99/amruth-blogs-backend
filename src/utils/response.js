/**
 *
 * @param {*} data
 * @param {*} statusCode
 * @returns
 *
 *
 * @example
 * ```ts
 * import { Response } from '/src/utils/response';
 *
 *   return Response({
 *    statusCode: 400,
 *    message: "Some random message",
 *  });
 * ```
 */

const Response = async (data = {}, statusCode = 200) => {
  // All log statements are written to CloudWatch
  console.info(
    `response: statusCode: ${data.statusCode || statusCode} body: ${data}`
  );

  return {
    statusCode: data.statusCode || statusCode,
    body: JSON.stringify(data),
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Content-Type": "application/json",
    },
  };
};

module.exports = { Response };
