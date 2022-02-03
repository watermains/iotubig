import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Meter, MeterDocument } from "./entities/meter.schema";

@Injectable()
export class MeterRepository {
  constructor(
    @InjectModel(Meter.name) private meterModel: Model<MeterDocument>,
    private jwtService: JwtService
  ) {}
  
  async dashboard(request) {
    const token = request.headers.authorization.replace('Bearer ', '')
    const user = this.jwtService.verify(token)
    const meter = await this.meterModel.findOne({iot_user_id: user.id})
    meter.balanceInPeso = MeterRepository.computeBalance(meter.allowed_flow);
    return { response: meter };
  }

  static computeBalance(allowedFlow) {
    //will change implementation once config feature is done
    const rate = 0.014;
    return allowedFlow * 0.014;
  }
}