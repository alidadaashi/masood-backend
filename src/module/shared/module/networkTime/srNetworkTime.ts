import { NtpTimeSync } from "ntp-time-sync";

const timeSync = NtpTimeSync.getInstance();

class SrNetworkTime {
  static async getNetworkTime(): Promise<Date> {
    const result = await timeSync.getTime();
    return result.now;
  }
}
export default SrNetworkTime;
