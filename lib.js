const crypto = require("crypto");


exports.createHash = (sep = "\u0000", hashType = "md5") => {
    return (...args) => {
        const hash = crypto.createHash(hashType);
        for (const val of args) {
            hash.update(sep);
            hash.update(val || Buffer.alloc(0));
        }
        return hash.digest("hex");
    };
};
