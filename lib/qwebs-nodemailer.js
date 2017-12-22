/*!
 * qwebs-nodemailer
 * Copyright(c) 2015 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict";

const util = require("util");
const nodemailer = require("nodemailer");
const { htmlToText } = require('nodemailer-html-to-text');
const fs = require("fs");
const { Error, UndefinedError } = require("oups");

class MailerService {
    constructor($config) {
        if (!$config) throw new UndefinedError("config");
        if (!$config.nodemailer) throw new UndefinedError("Nodemailer section in config.");
        if (!$config.nodemailer.transport) throw new UndefinedError("Nodemailer transport section in config.");

        this.config = $config;
        this.transporter = nodemailer.createTransport({ pool: true, ...$config.nodemailer.transport });
        if ($config.nodemailer["html-to-text"] != false)
            this.transporter.use('compile', htmlToText());
        this.nodemailerSendMail = util.promisify(this.transporter.sendMail).bind(this.transporter);
    };

    async unmount() {
        this.transporter.close();  
    }

    async sendMail(mailOptions) {
        if (!mailOptions) throw new UndefinedError("MailOptions");
    
        if (!mailOptions.from) {
            if (!this.config.nodemailer.from) throw new UndefinedError("Nodemailer from in qwebs config.");
            mailOptions.from = this.config.nodemailer.from;
        }
    
        if (this.config.environment != "prod") {
            if (!this.config.nodemailer.dev) throw new UndefinedError("Nodemailer debug in qwebs config.");
            if (!this.config.nodemailer.dev.to) throw new UndefinedError("Nodemailer debug to in qwebs config.");

            mailOptions.to = this.config.nodemailer.dev.to;
        }
        
        await this.nodemailerSendMail(options);
    };
};

exports = module.exports = MailerService;