import { PlayerInfoProt } from '@2004scape/rsbuf';

import WordEnc from '#/cache/wordenc/WordEnc.js';
import Player from '#/engine/entity/Player.js';
import World from '#/engine/World.js';
import Packet from '#/io/Packet.js';
import ClientGameMessageHandler from '#/network/game/client/ClientGameMessageHandler.js';
import MessagePublic from '#/network/game/client/model/MessagePublic.js';
import WordPack from '#/wordenc/WordPack.js';

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

        const unpacked = WordPack.unpack(new Packet(input), input.length);

        if (unpacked.startsWith('//')) {
            const clanMessage = unpacked.substring(2).trim();
            if (clanMessage.length === 0) {
                player.messageGame('Usage: // [message]');
                return true;
            }

            if (player.clanName) {
                const broadcastText = `[@dre@${player.displayName}@bla@]: ${clanMessage}`;
                World.broadcastClan(player.clanName, broadcastText, player);
                player.wrappedMessageGame(broadcastText, 2);
            } else {
                player.messageGame('You are not in a clan.');
            }
            return true;
        }

        if (unpacked.startsWith('/')) {
            const yellMessage = unpacked.substring(1).trim();
            if (yellMessage.length === 0) {
                player.messageGame('Usage: / [message]');
                return true;
            }

            const now = Date.now();
            if (now - player.lastYellTime < 5000) {
                player.messageGame(`You must wait ${5 - Math.ceil((now - player.lastYellTime) / 1000)} seconds before shouting again.`);
                return true;
            }

            player.lastYellTime = now;
            if (player.clanName != null) {
                const broadcastText = `[@dbl@${player.displayName}@bla@]: ${yellMessage}`;
                World.broadcastYell(broadcastText, player);
                player.wrappedMessageGame(broadcastText, 2); // show same format to sender
            } else {
                const broadcastText = `[@dbl@${player.displayName}@bla@]: ${yellMessage}`;
                World.broadcastYell(broadcastText, player);
                player.wrappedMessageGame(broadcastText, 2); // show same format to sender
            }
            return true;
        }

        const filtered = WordEnc.filter(unpacked);

        const packBuf = Packet.alloc(0);
        WordPack.pack(packBuf, filtered);

        player.chatColour = colour;
        player.chatEffect = effect;
        player.chatRights = Math.min(player.staffModLevel, 2);
        player.chatMessage = new Uint8Array(packBuf.data.subarray(0, packBuf.pos));
        player.masks |= PlayerInfoProt.CHAT;
        player.logMessage = filtered;

        packBuf.release();

        player.socialProtect = true;
        return true;
    }
}