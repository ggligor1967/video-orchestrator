import { ErrorResponses } from '../utils/errorResponse.js';

export const createNotFoundHandler = () => {
  return (req, res) => {
    return ErrorResponses.endpointNotFound(res);
  };
};
