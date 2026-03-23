import Player from '#/engine/entity/Player.js';
import ScriptState from '#/engine/script/ScriptState.js';
import ClientGameMessageHandler from '#/network/game/client/ClientGameMessageHandler.js';
import ResumePStringDialog from '#/network/game/client/model/ResumePStringDialog.js';

export default class ResumePStringDialogHandler extends ClientGameMessageHandler<ResumePStringDialog> {
    handle(message: ResumePStringDialog, player: Player): boolean {
        const { input } = message;

        if (!player.activeScript || player.activeScript.execution !== ScriptState.STRINGDIALOG) {
            return false;
        }

        player.activeScript.lastString = input;
        player.executeScript(player.activeScript, true, true);
        return true;
    }
}
