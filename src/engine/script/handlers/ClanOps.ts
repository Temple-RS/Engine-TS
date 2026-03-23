import World from '#/engine/World.js';
import { CommandHandlers } from '#/engine/script/ScriptRunner.js';
import { ScriptOpcode } from '#/engine/script/ScriptOpcode.js';

const ClanOps: CommandHandlers = {
    [ScriptOpcode.CLAN_NAME]: (state) => {
        const player = state.activePlayer;
        state.pushString(player.clanName ?? '');
    },

    [ScriptOpcode.CLAN_SCORE]: (state) => {
        const player = state.activePlayer;
        if (!player.clanName) {
            state.pushInt(0);
            return;
        }

        const clan = World.getClan(player.clanName);
        state.pushInt(clan ? clan.score : 0);
    },

    [ScriptOpcode.CLAN_OWNER]: (state) => {
        const player = state.activePlayer;
        if (!player.clanName) {
            state.pushInt(0);
            return;
        }

        const clan = World.getClan(player.clanName);
        state.pushInt(clan && clan.isOwner(player) ? 1 : 0);
    },

    [ScriptOpcode.CLAN_MEMBERCOUNT]: (state) => {
        const player = state.activePlayer;
        if (!player.clanName) {
            state.pushInt(0);
            return;
        }

        const clan = World.getClan(player.clanName);
        state.pushInt(clan ? clan.memberNames.size : 0);
    },

    [ScriptOpcode.CLAN_ONLINECOUNT]: (state) => {
        const player = state.activePlayer;
        if (!player.clanName) {
            state.pushInt(0);
            return;
        }

        const clan = World.getClan(player.clanName);
        state.pushInt(clan ? clan.members.size : 0);
    },

    [ScriptOpcode.CLAN_BROADCAST]: (state) => {
        const msg = state.popString();
        const player = state.activePlayer;
        if (player.clanName) {
            World.broadcastClan(player.clanName, msg);
        }
    },

    [ScriptOpcode.CLAN_JOIN]: (state) => {
        const clanName = state.popString();
        const player = state.activePlayer;
        World.joinClan(player, clanName);
    },

    [ScriptOpcode.CLAN_LEAVE]: (state) => {
        const player = state.activePlayer;
        World.leaveClan(player);
    },
    
    [ScriptOpcode.CLAN_LOCKED]: (state) => {
        const player = state.activePlayer;
        if (!player.clanName) {
            state.pushInt(0);
            return;
        }
        
        const clan = World.getClan(player.clanName);
        state.pushInt(clan && clan.locked ? 1 : 0);
    },
    
    [ScriptOpcode.CLAN_INVITE]: (state) => {
        const targetName = state.popString().toLowerCase();
        const player = state.activePlayer;
        if (!player.clanName) return;
        
        const clan = World.getClan(player.clanName);
        if (clan && clan.isOwner(player)) {
            clan.invites.add(targetName);
        }
    },

    [ScriptOpcode.CLAN_CREATE]: (state) => {
        const clanName = state.popString();
        const player = state.activePlayer;
        state.pushInt(World.createClan(player, clanName) ? 1 : 0);
    }
};

export default ClanOps;
