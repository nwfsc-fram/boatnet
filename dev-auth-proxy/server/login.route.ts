import {Request, Response} from 'express';

export function login(req: Request, res: Response) {

    const credentials = req.body;

    console.log('TODO Parse Temp Credentials', req.body);
    res.sendStatus(403);
}
