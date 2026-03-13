import Fastify from "fastify";
const PORT = process.env.PORT as string;
const app = Fastify({
    logger : true
});

app.listen({port : 4000} , () => {
    console.log(`Server running at Port ${PORT}`)
})