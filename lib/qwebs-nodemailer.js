/*!
 * qwebs-nodemailer
 * Copyright(c) 2015 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict";

const util = require("util");
const nodemailer = require("nodemailer");
const { htmlToText } = require('nodemailer-html-to-text');
const mustache = require("mustache");
const fs = require("fs");
const { Error, UndefinedError } = require("oups");

class MailerService {
    constructor($config, $repositoryFactory) {
        if (!$config) throw new UndefinedError("$config");
        if (!$repositoryFactory) throw new UndefinedError("$repositoryFactory");
        if (!$config.nodemailer) throw new UndefinedError("Nodemailer section in config.");
        if (!$config.nodemailer.transport) throw new UndefinedError("Nodemailer transport section in config.");

        this.config = $config;
        this.repositoryFactory = $repositoryFactory;

        this.transporter = nodemailer.createTransport({ pool: true, ...$config.nodemailer.transport });
        if ($config.nodemailer["html-to-text"] != false)
            this.transporter.use('compile', htmlToText());
        this.nodemailerSendMail = util.promisify(this.transporter.sendMail).bind(this.transporter);
    };

    async mount() {
        if (this.config.nodemailer.templates) 
            this.templates = await this.repositoryFactory.create(this.config.nodemailer.templates);
    }

    async unmount() {
        this.transporter.close();  
    }

    async sendMail(options, templateOptions = {}, model = {}) {
        if (!options) throw new UndefinedError("options");
        
        model.host = model.host || this.config.host;

        if (this.templates) {
            if (templateOptions.subject) options.subject = mustache.render(this.templates.find(templateOptions.subject), model);

            if (templateOptions.html) {
                if (/false/ig.test(templateOptions.htmlWrapper)) {
                    model.css = this.templates.email.css;
                    options.html = mustache.render(this.templates.find(templateOptions.html), model);
                }
                else {
                    const model2 = {
                        host: model.host,
                        css: this.templates.email.css,
                        body: mustache.render(this.templates.find(templateOptions.html), model)
                    }
                    options.html = mustache.render(this.templates.email.html, model2);
                }
            }
        }
        
        if(!options.subject) throw new UndefinedError("Subject");
        if(!options.html) throw new UndefinedError("Html");
        if(!options.to) throw new UndefinedError("to");

        if (!options.from) {
            if (!this.config.nodemailer.from) throw new UndefinedError("Nodemailer from in qwebs config.");
            options.from = this.config.nodemailer.from;
        }
        
        await this.nodemailerSendMail(options);
    };
};

exports = module.exports = MailerService;