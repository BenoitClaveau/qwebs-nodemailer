/*!
 * qwebs-nodemailer
 * Copyright(c) 2015 Benoît Claveau
 * MIT Licensed
 */
"use strict";

const nodemailer = require("nodemailer");
const signer = require("nodemailer-dkim").signer;
const smtpPool = require("nodemailer-smtp-pool");
const fs = require("fs");
const DataError = require("qwebs").DataError;

class MailerService {
    constructor($config) {
        if (!$config) throw new DataError({ message: "[MailerService] Qwebs config is not defined."});
        if (!$config.nodemailer) throw new DataError({ message: "Nodemailer section is not defined in qwebs config."});
        if (!$config.nodemailer.transport) throw new DataError({ message: "Nodemailer transport section is not defined in qwebs config."});

        this.$config = $config;
        this.transporter = nodemailer.createTransport(smtpPool($config.nodemailer.transport));

        if ($config.nodemailer.dkim) {
            if (!$config.nodemailer.dkim) throw new DataError({ message: "Nodemailer dkim section is not defined in qwebs config."});
            if (!$config.nodemailer.dkim.domainName) throw new DataError({ message: "Nodemailer dkim domainName is not defined in qwebs config."});
            if (!$config.nodemailer.dkim.keySelector) throw new DataError({ message: "Nodemailer dkim keySelector is not defined in qwebs config."});
            if (!$config.nodemailer.dkim.privateKey) throw new DataError({ message: "Nodemailer dkim privateKey is not defined in qwebs config."});
        
            let privateKey = fs.readFileSync($config.nodemailer.dkim.privateKey);

            this.transporter.use("stream", signer({
                domainName: $config.nodemailer.dkim.domainName,
                keySelector: $config.nodemailer.dkim.keySelector,
                privateKey: privateKey
            }));
        }
    };

    send(mailOptions) {
        return Promise.resolve().then(() => {
            if (!mailOptions) throw new DataError({ message: "MailOptions are not defined."});
        
            if (!mailOptions.from) {
                if (!this.$config.nodemailer.from) throw new DataError({ message: "Nodemailer from is not defined in qwebs config."});
                mailOptions.from = this.$config.nodemailer.from;
            }
        
            if (this.$config.environment != "prod") {
                if (!this.$config.nodemailer.dev) throw new DataError({ message: "Nodemailer debug is not defined in qwebs config."});
                if (!this.$config.nodemailer.dev.to) throw new DataError({ message: "Nodemailer debug to is not defined in qwebs config."});

                mailOptions.to = this.$config.nodemailer.dev.to;
            }
            
            return new Promise((resolve, reject) => {
                this.transporter.sendMail(mailOptions, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
        });
    };
};

exports = module.exports = MailerService;