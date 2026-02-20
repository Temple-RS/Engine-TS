import { PlayerInfoProt } from '@2004scape/rsbuf';

import Player from '#/engine/entity/Player.js';
import ClientGameMessageHandler from '#/network/game/client/ClientGameMessageHandler.js';
import MessagePublic from '#/network/game/client/model/MessagePublic.js';

export default class MessagePublicHandler extends ClientGameMessageHandler<MessagePublic> {
    handle(message: MessagePublic, player: Player): boolean {
        const { colour, effect, input } = message;

        if (player.socialProtect || colour < 0 || colour > 11 || effect < 0 || effect > 2 || input.length > 100) {
            return false;
        }

        if (player.muted_until !== null && player.muted_until > new Date()) {
            // todo: do we still log their attempt to chat?
            return false;
        }

        player.chatColour = colour;
        player.chatEffect = effect;
        player.chatRights = Math.min(player.staffModLevel, 2);
        player.chatMessage = input;
        player.masks |= PlayerInfoProt.CHAT;

        player.socialProtect = true;
        return true;
    }
}