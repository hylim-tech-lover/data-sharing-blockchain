import morgan, { StreamOptions } from "morgan";

import Logger from "./logger";

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
    // Use the http severity
    write: (message) => Logger.http(message),
};

// Build the morgan middleware
const morganMiddleware = morgan(
    // Define message format string (this is the default one).
    // The message format is made from tokens that defined inside Morgan library
    ":method :url [Status code: :status, Content length: :res[content-length]] - :response-time ms",
    // Options: in this case, I overwrote the stream and the skip logic.
    // See the methods above.
    { stream }
);

export default morganMiddleware;


