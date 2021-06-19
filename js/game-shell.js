const FileDownloadStream = require('./lib/net/file-download-stream');

module.exports = {
    timings: [],

    async readDataFile(file, description, percent) {
        file = `./data204/${file}`;

        this.showLoadingProgress(percent, `Loading ${description} - 0%`);

        const fileDownloadStream = new FileDownloadStream(file);

        const header = new Int8Array(6);
        await fileDownloadStream.readFully(header, 0, 6);

        const archiveSize =
            ((header[0] & 0xff) << 16) +
            ((header[1] & 0xff) << 8) +
            (header[2] & 0xff);

        const archiveSizeCompressed =
            ((header[3] & 0xff) << 16) +
            ((header[4] & 0xff) << 8) +
            (header[5] & 0xff);

        this.showLoadingProgress(percent, `Loading ${description} - 5%`);

        let read = 0;
        const archiveData = new Int8Array(archiveSizeCompressed);

        while (read < archiveSizeCompressed) {
            let length = archiveSizeCompressed - read;

            if (length > 1000) {
                length = 1000;
            }

            await fileDownloadStream.readFully(archiveData, read, length);
            read += length;

            this.showLoadingProgress(
                percent,
                `Loading ${description} - ` +
                    ((5 + (read * 95) / archiveSizeCompressed) | 0) +
                    '%'
            );
        }

        this.showLoadingProgress(percent, `Unpacking ${description}`);

        if (archiveSizeCompressed !== archiveSize) {
            const decompressed = new Int8Array(archiveSize);

            BZLib.decompress(
                decompressed,
                archiveSize,
                archiveData,
                archiveSizeCompressed,
                0
            );

            return decompressed;
        }

        return archiveData;
    },

};
