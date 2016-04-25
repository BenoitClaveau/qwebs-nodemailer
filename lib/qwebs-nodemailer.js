/*!
 * qwebs-nodemailer
 * Copyright(c) 2015 Benoît Claveau
 * MIT Licensed
 */
"use strict";

const Q = require("q");
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
        if (!$config.nodemailer.dkim) throw new DataError({ message: "Nodemailer dkim section is not defined in qwebs config."});
        if (!$config.nodemailer.dkim.domainName) throw new DataError({ message: "Nodemailer dkim domainName is not defined in qwebs config."});
        if (!$config.nodemailer.dkim.keySelector) throw new DataError({ message: "Nodemailer dkim keySelector is not defined in qwebs config."});
        if (!$config.nodemailer.dkim.privateKey) throw new DataError({ message: "Nodemailer dkim privateKey is not defined in qwebs config."});
        
        this.$config = $config;

        let privateKey = fs.readFileSync($config.nodemailer.dkim.privateKey);
        
        this.transporter = nodemailer.createTransport(smtpPool($config.nodemailer.transport));
        this.transporter.use("stream", signer({
            domainName: $config.nodemailer.dkim.domainName,
            keySelector: $config.nodemailer.dkim.keySelector,
            privateKey: privateKey
        }));
    };

    send(mailOptions) {
        var self = this;
        
        return Q.try(function() {
            if (!mailOptions) throw new DataError({ message: "MailOptions are not defined."});
        
            if (!mailOptions.from) {
                if (!self.$config.nodemailer.from) throw new DataError({ message: "Nodemailer from is not defined in qwebs config."});
                mailOptions.from = self.$config.nodemailer.from;
            }
        
            if (self.$config.environment != "prod") {
                if (!self.$config.nodemailer.dev) throw new DataError({ message: "Nodemailer debug is not defined in qwebs config."});
                if (!self.$config.nodemailer.dev.to) throw new DataError({ message: "Nodemailer debug to is not defined in qwebs config."});

                mailOptions.to = self.$config.nodemailer.dev.to;
            }
            
            return Q.ninvoke(self.transporter, "sendMail", mailOptions).then(function() {
                return mailOptions; 
            });
        });
    };
};

exports = module.exports = MailerService;