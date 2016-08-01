/**
 * Created by Yun on 2015/7/30.
 */
"use strict";

function parseShortcuts(option, shortcuts){
    if (option.shortcut){
        shortcuts[option.shortcut] = option;
    } else if(option.shortcuts) {
        for (let c of option.shortcuts) {
            shortcuts[c] = option;
        }
    }
}

function splitArguments(line){
    let argv = [];
    for (let i = 0; i < line.length; i++){
        if (line[i] == ' ' || line[i] == '\t'){
            continue;
        }

        let split = "";
        let quote = false;
        for (;i<line.length; i++){
            if (line[i] == '"'){
                if (quote && line[i+1] == '"'){
                    split = split+ '"';
                    ++i;
                } else {
                    quote = !quote;
                }
            } else if (!quote && (line[i] == ' ' || line[i] == '\t')){
                break;
            } else{
                split = split + line[i];
            }
        }
        argv.push(split);
    }
    return argv;
}

function parse(config, argv){
    if (!argv){
        argv = process.argv.slice(2);
    } else if (typeof(argv) == 'string'){
        //TODO: support "", support "" with space, support \"
        argv = splitArguments(argv);
    }
    let options = {};

    let shortcuts = {};
    for (let name in config.globalOptions){
        config.globalOptions[name].name = name;
        parseShortcuts(config.globalOptions[name], shortcuts);
        if (config.globalOptions[name].default){
            options[name] = config.globalOptions[name].default;
        }
    }

    let args = [];
    let command, commandName, commandOptions = {};

    if (config.useCommand){
        if (argv.length == 0 || argv[0][0] == '-'){
            commandName = config.defaultCommand;
            if (!commandName){
                throw new Error("No default command. Must provide a command.");
            }
        } else {
            commandName = argv.shift();
        }
        command = config.commands[commandName];
        if (!command && !config.allowUnknownCommand) {
            throw new Error("Unknown command "+commandName);
        } else {
            commandOptions = command.options;
            for (let name in commandOptions) {
                commandOptions[name].name = name;
                parseShortcuts(commandOptions[name], shortcuts);
                if (commandOptions[name].default){
                    options[name] = commandOptions[name].default;
                }
            }
        }
    }

    for (var i = 0; i< argv.length; i++){
        let arg = argv[i];

        if (arg[0] == '-'){
            let option, value, name;
            if (arg[1] == '-'){
                name = arg.substr(2);
                option = (commandOptions && commandOptions[name]) || config.globalOptions[name];
            } else {
                name = arg[1];
                option = shortcuts[arg[1]];
                value = arg.substr(2);
            }
            if (!option){
                // Test --no-XXX
                if (name.substr(0, 3) == 'no-'){
                    name = name.substr(3);
                    option = (commandOptions && commandOptions[name]) || config.globalOptions[name];
                    options[name] = undefined;
                    continue;
                }
                // Unknown option
                if (!config.allowUnknownOption){
                    throw new Error("Unknown option "+arg);
                }
                options[name] = value;
                continue;
            }
            if (option.hasValue){
                if (!value){
                    if (argv[i+1][0] != '-') {
                        value = argv[++i];
                    }
                    if (!value){
                        throw new Error("Option "+arg+" should provide a value.");
                    }
                }
                let type = option.type || 'string';
                if (type==='number'){
                    value = parseFloat(value);
                } else if (type==='int'){
                    value = parseInt(value);
                }
                options[option.name] = value;
            } else {
                options[option.name] = true;
            }
        } else {
            args.push(arg);
        }
    }

    if (args.length < options.minArgCount){
        throw new Error("Require "+options.requireArgCount+" arguments");
    }
    if (args.length > options.maxArgCount){
        throw new Error("At most "+options.requireArgCount+" arguments");
    }

    if (config.useCommand) {
        return {
            command: commandName,
            options,
            args
        }
    } else {
        return {
            options,
            args
        }
    }
}

exports.parse = parse;

function displayHelp(config, command, out){
    out = out || process.stdout;
    throw new Error("Not implemented yet.");
}

exports.displayHelp = displayHelp;

