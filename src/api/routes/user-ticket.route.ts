import express, { Request, Response, Router } from "express";
import { UserTicketController } from "../controllers/user-ticket.controller";


export const createUserTicketRoutes = (userTicketController: UserTicketController): Router => {
    const router: Router = express.Router();
    /**
     * POST /api/v1/user/ticket
     * Add a new user ticket
     */
    router.post('/', async (req: Request, res: Response) => {
        await userTicketController.addNewUserTicket(req, res);
    });  

    return router;
}