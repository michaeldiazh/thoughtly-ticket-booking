import { Request, Response } from "express";
import { UserTicketService } from "./user-ticket.service";
import { UserTicket, UserTicketRequest, UserTicketRequestSchema } from "./user-ticket.types";
import { buildSucceededSingleResponse } from "../../domain/common.dto";
import { handleError } from "../../shared/utils";
import { Validator } from "../../shared/validator";
import { createZodValidator, convertValidationErrorToInvalidRequestError } from "../../shared/validator";
export class UserTicketController {
    private userTicketRequestValidator: Validator<UserTicketRequest>;
    constructor(private readonly userTicketService: UserTicketService) {    
        this.userTicketRequestValidator = createZodValidator<UserTicketRequest>(UserTicketRequestSchema, convertValidationErrorToInvalidRequestError);
    }

    /**
     * POST /api/v1/user/ticket
     * Add a new user ticket
     */
    async addNewUserTicket(req: Request, res: Response): Promise<void> {
        try {
            const request: UserTicketRequest = this.userTicketRequestValidator.validate(req.body);
            const userTicket: UserTicket = await this.userTicketService.addNewUserTicket(request);
            res.status(201)
                .json(
                    buildSucceededSingleResponse(userTicket)
                );
        } catch (error) {
            handleError(error, res);
        }
    }
}
