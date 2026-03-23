import Packet from '#/io/Packet.js';
import ClientGameMessageDecoder from '#/network/game/client/ClientGameMessageDecoder.js';
import ClientGameProt from '#/network/game/client/ClientGameProt.js';
import ResumePStringDialog from '#/network/game/client/model/ResumePStringDialog.js';

export default class ResumePStringDialogDecoder extends ClientGameMessageDecoder<ResumePStringDialog> {
    prot = ClientGameProt.RESUME_P_STRINGDIALOG;

    decode(buf: Packet) {
        const input = buf.gjstr();

        return new ResumePStringDialog(input);
    }
}
