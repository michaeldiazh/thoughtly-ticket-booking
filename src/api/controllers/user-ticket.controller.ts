import { Request, Response } from "express";
import { UserTicketService } from "../../service/user-ticket.service";
import { UserTicket, UserTicketRequest } from "../../domain/dtos";
import { handleError } from "../utils";
import { Validator } from "../../domain/validator/validator.interface";
import { createZodValidator } from "../../domain/validator/zod-validator.factory";
import { UserTicketRequestSchema, userTicketRequestErrorConverter } from "../../domain/dtos/user-ticket/user-ticket-request.dto";
export class UserTicketController {
    private userTicketRequestValidator: Validator<UserTicketRequest>;
    constructor(private readonly userTicketService: UserTicketService) {    
        this.userTicketRequestValidator = createZodValidator<UserTicketRequest>(UserTicketRequestSchema, userTicketRequestErrorConverter);
    }

    /**
     * POST /api/v1/user/ticket
     * Add a new user ticket
     */
    async addNewUserTicket(req: Request, res: Response): Promise<void> {
        try {
            const request: UserTicketRequest = this.userTicketRequestValidator.validate(req.body);
            const userTicket: UserTicket = await this.userTicketService.addNewUserTicket(request);
            res.status(201).json(userTicket);
        } catch (error) {
            handleError(error, res);
        }
    }
}