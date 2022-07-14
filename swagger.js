const swaggerJsdoc = require("swagger-jsdoc");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ebinaa API with Swagger",
            version: "1.1.0",
            description: "This is Ebinaa APIs application made with Express and documented with Swagger",
        },
        servers: [
            {
                url: 'https://dev.uiplonline.com:4055'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-access-token',
                }
            }
        },
        security: [{
            bearerAuth: [],
            ApiKeyAuth:[]
        }]
    },
    apis: ["./swagger.js", "./controllers/*.js", "./models/*.js"],
};
const specs = swaggerJsdoc(options);
module.exports = specs;

/**
* @swagger
* components:
*  schemas:
*   SuccessResponse:
*    type: object
*    example:
*     status: 200
*     data: []
*     message: success message
*     purpose: api purpose
*   ErrorResponse:
*    type: object
*    example:
*     status: 500
*     data: []
*     message: error message
*     purpose: api purpose
*   ValidationResponse:
*    type: object
*    example:
*     status: 422
*     data: []
*     message: validation error message
*     purpose: api purpose
*/