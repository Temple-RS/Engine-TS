import Player from '#/engine/entity/Player.js';
import ClientGameMessageHandler from '#/network/game/client/ClientGameMessageHandler.js';
import ReportAbuse, { ReportAbuseReason } from '#/network/game/client/model/ReportAbuse.js';

export default class ReportAbuseHandler extends ClientGameMessageHandler<ReportAbuse> {
    handle(message: ReportAbuse, player: Player): boolean {
        if (player.reportAbuseProtect) {
            return false;
        }

        if (message.reason < ReportAbuseReason.OFFENSIVE_LANGUAGE || message.reason > ReportAbuseReason.REAL_WORLD_TRADING) {
            return false;
        }

        player.messageGame('Thank you for your report.');
        return true;
    }
}
