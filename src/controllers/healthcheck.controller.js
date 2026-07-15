import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
/*
const healthcheck = async (req, res,next) => {
    try {
        const user = await getuserDB()
        res
            .status(200)
            .json(new ApiResponse(200, { message: "server is running" }));

    } catch (error) {

    }
};*/

const healthcheck = asyncHandler(async (req, res) => {
    res
    .status(200)
    .json(new ApiRespose(200, { message: "server is running" }));
});

export { healthcheck };