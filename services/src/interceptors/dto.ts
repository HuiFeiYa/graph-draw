import { Request } from 'express';
import { formatTime } from 'src/utils/common';

export class RequestLog {
  method:string
  url:string
  query:any
  body:any
  time = Date.now()
  formatTime = formatTime(Date.now())
  useTime:number

  constructor(req:Request) {
    this.method = req.method;
    this.url = req.url;
    this.query = req.query;
    this.body = req.body;

  }

}