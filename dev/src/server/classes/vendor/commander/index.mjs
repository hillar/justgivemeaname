/*

partial convert from es6 to es6

see https://github.com/tj/commander.js/blob/713db77d5744a9274ee3812400243ffaae3b7abc/index.js


(The MIT License)

Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
Copyright (c) 2018 Hillar Aarelaid <hillar@aarelaid.net>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { dirname, basename }  from 'path';
import { lstatSync, readlinkSync, statSync } from 'fs';



/**
 * Initialize a new `Option` with the given `flags` and `description`.
 *
 * @param {String} flags
 * @param {String} description
 * @api public
 */

class Option {
  constructor(flags, description) {
    this.flags = flags;
    this.required = flags.indexOf('<') >= 0;
    this.optional = flags.indexOf('[') >= 0;
    this.bool = flags.indexOf('-no-') === -1;
    flags = flags.split(/[ ,|]+/);
    if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
    this.long = flags.shift();
    this.description = description || '';
  }

  /**
   * Return option name.
   *
   * @return {String}
   * @api private
   */

  name() {
    return this.long
      .replace('--', '')
      .replace('no-', '');
  }

  /**
   * Return option name, in a camelcase format that can be used
   * as a object attribute key.
   *
   * @return {String}
   * @api private
   */

  attributeName() {
    return camelcase(this.name());
  }

  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {String} arg
   * @return {Boolean}
   * @api private
   */

  is(arg) {
    return this.short === arg || this.long === arg;
  }
}

/**
 * Initialize a new `Command`.
 *
 * @param {String} name
 * @api public
 */

export class Command  extends EventEmitter {
  constructor(name) {
    super()
    this.commands = [];
    this.options = [];
    this._execs = {};
    this._allowUnknownOption = false;
    this._args = [];
    this._name = name || '';
  }

  /**
   * Add command `name`.
   *
   * The `.action()` callback is invoked when the
   * command `name` is specified via __ARGV__,
   * and the remaining arguments are applied to the
   * function for access.
   *
   * When the `name` is "*" an un-matched command
   * will be passed as the first arg, followed by
   * the rest of __ARGV__ remaining.
   *
   * Examples:
   *
   *      program
   *        .version('0.0.1')
   *        .option('-C, --chdir <path>', 'change the working directory')
   *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
   *        .option('-T, --no-tests', 'ignore test hook')
   *
   *      program
   *        .command('setup')
   *        .description('run remote setup commands')
   *        .action(function() {
   *          console.log('setup');
   *        });
   *
   *      program
   *        .command('exec <cmd>')
   *        .description('run the given remote command')
   *        .action(function(cmd) {
   *          console.log('exec "%s"', cmd);
   *        });
   *
   *      program
   *        .command('teardown <dir> [otherDirs...]')
   *        .description('run teardown commands')
   *        .action(function(dir, otherDirs) {
   *          console.log('dir "%s"', dir);
   *          if (otherDirs) {
   *            otherDirs.forEach(function (oDir) {
   *              console.log('dir "%s"', oDir);
   *            });
   *          }
   *        });
   *
   *      program
   *        .command('*')
   *        .description('deploy the given env')
   *        .action(function(env) {
   *          console.log('deploying "%s"', env);
   *        });
   *
   *      program.parse(process.argv);
    *
   * @param {String} name
   * @param {String} [desc] for git-style sub-commands
   * @return {Command} the new command
   * @api public
   */

  command(name, desc, opts) {
    if (typeof desc === 'object' && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const args = name.split(/ +/);
    const cmd = new Command(args.shift());

    if (desc) {
      cmd.description(desc);
      this.executables = true;
      this._execs[cmd._name] = true;
      if (opts.isDefault) this.defaultExecutable = cmd._name;
    }
    cmd._noHelp = !!opts.noHelp;
    this.commands.push(cmd);
    cmd.parseExpectedArgs(args);
    cmd.parent = this;

    if (desc) return this;
    return cmd;
  }

  /**
   * Define argument syntax for the top-level command.
   *
   * @api public
   */

  arguments(desc) {
    return this.parseExpectedArgs(desc.split(/ +/));
  }

  /**
   * Add an implicit `help [cmd]` subcommand
   * which invokes `--help` for the given command.
   *
   * @api private
   */

  addImplicitHelpCommand() {
    this.command('help [cmd]', 'display help for [cmd]');
  }

  /**
   * Parse expected `args`.
   *
   * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
   *
   * @param {Array} args
   * @return {Command} for chaining
   * @api public
   */

  parseExpectedArgs(args) {
    if (!args.length) return;
    const self = this;
    args.forEach(arg => {
      const argDetails = {
        required: false,
        name: '',
        variadic: false
      };

      switch (arg[0]) {
        case '<':
          argDetails.required = true;
          argDetails.name = arg.slice(1, -1);
          break;
        case '[':
          argDetails.name = arg.slice(1, -1);
          break;
      }

      if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
        argDetails.variadic = true;
        argDetails.name = argDetails.name.slice(0, -3);
      }
      if (argDetails.name) {
        self._args.push(argDetails);
      }
    });
    return this;
  }

  /**
   * Register callback `fn` for the command.
   *
   * Examples:
   *
   *      program
   *        .command('help')
   *        .description('display verbose help')
   *        .action(function() {
   *           // output help here
   *        });
   *
   * @param {Function} fn
   * @return {Command} for chaining
   * @api public
   */

  action(fn) {
    const self = this;
    const listener = (args, unknown) => {
      // Parse any so-far unknown options
      args = args || [];
      unknown = unknown || [];

      const parsed = self.parseOptions(unknown);

      // Output help if necessary
      outputHelpIfNecessary(self, parsed.unknown);

      // If there are still any unknown options, then we simply
      // die, unless someone asked for help, in which case we give it
      // to them, and then we die.
      if (parsed.unknown.length > 0) {
        self.unknownOption(parsed.unknown[0]);
      }

      // Leftover arguments need to be pushed back. Fixes issue #56
      if (parsed.args.length) args = parsed.args.concat(args);

      self._args.forEach((arg, i) => {
        if (arg.required && args[i] == null) {
          self.missingArgument(arg.name);
        } else if (arg.variadic) {
          if (i !== self._args.length - 1) {
            self.variadicArgNotLast(arg.name);
          }

          args[i] = args.splice(i);
        }
      });

      // Always append ourselves to the end of the arguments,
      // to make sure we match the number of arguments the user
      // expects
      if (self._args.length) {
        args[self._args.length] = self;
      } else {
        args.push(self);
      }

      fn.apply(self, args);
    };
    const parent = this.parent || this;
    const name = parent === this ? '*' : this._name;
    parent.on(`command:${name}`, listener);
    if (this._alias) parent.on(`command:${this._alias}`, listener);
    return this;
  }

  /**
   * Define option with `flags`, `description` and optional
   * coercion `fn`.
   *
   * The `flags` string should contain both the short and long flags,
   * separated by comma, a pipe or space. The following are all valid
   * all will output this way when `--help` is used.
   *
   *    "-p, --pepper"
   *    "-p|--pepper"
   *    "-p --pepper"
   *
   * Examples:
   *
   *     // simple boolean defaulting to false
   *     program.option('-p, --pepper', 'add pepper');
   *
   *     --pepper
   *     program.pepper
   *     // => Boolean
   *
   *     // simple boolean defaulting to true
   *     program.option('-C, --no-cheese', 'remove cheese');
   *
   *     program.cheese
   *     // => true
   *
   *     --no-cheese
   *     program.cheese
   *     // => false
   *
   *     // required argument
   *     program.option('-C, --chdir <path>', 'change the working directory');
   *
   *     --chdir /tmp
   *     program.chdir
   *     // => "/tmp"
   *
   *     // optional argument
   *     program.option('-c, --cheese [type]', 'add cheese [marble]');
   *
   * @param {String} flags
   * @param {String} description
   * @param {Function|*} [fn] or default
   * @param {*} [defaultValue]
   * @return {Command} for chaining
   * @api public
   */

  option(flags, description, fn, defaultValue) {
    const self = this, option = new Option(flags, description), oname = option.name(), name = option.attributeName();

    // default as 3rd arg
    if (typeof fn !== 'function') {
      if (fn instanceof RegExp) {
        const regex = fn;
        fn = (val, def) => {
          const m = regex.exec(val);
          return m ? m[0] : def;
        };
      } else {
        defaultValue = fn;
        fn = null;
      }
    }

    // preassign default value only for --no-*, [optional], or <required>
    if (!option.bool || option.optional || option.required) {
      // when --no-* we make sure default is true
      if (!option.bool) defaultValue = true;
      // preassign only if we have a default
      if (defaultValue !== undefined) {
        self[name] = defaultValue;
        option.defaultValue = defaultValue;
      }
    }

    // register the option
    this.options.push(option);

    // when it's passed assign the value
    // and conditionally invoke the callback
    this.on(`option:${oname}`, val => {
      // coercion
      if (val !== null && fn) {
        val = fn(val, self[name] === undefined ? defaultValue : self[name]);
      }

      // unassigned or bool
      if (typeof self[name] === 'boolean' || typeof self[name] === 'undefined') {
        // if no value, bool true, and we have a default, then use it!
        if (val == null) {
          self[name] = option.bool
            ? defaultValue || true
            : false;
        } else {
          self[name] = val;
        }
      } else if (val !== null) {
        // reassign
        self[name] = val;
      }
    });

    return this;
  }

  /**
   * Allow unknown options on the command line.
   *
   * @param {Boolean} arg if `true` or omitted, no error will be thrown
   * for unknown options.
   * @api public
   */
  allowUnknownOption(arg) {
    this._allowUnknownOption = arguments.length === 0 || arg;
    return this;
  }

  /**
   * Parse `argv`, settings options and invoking commands when defined.
   *
   * @param {Array} argv
   * @return {Command} for chaining
   * @api public
   */

  parse(argv) {
    // implicit help
    if (this.executables) this.addImplicitHelpCommand();

    // store raw args
    this.rawArgs = argv;

    // guess name
    this._name = this._name || basename(argv[1], '.js');

    // github-style sub-commands with no sub-command
    if (this.executables && argv.length < 3 && !this.defaultExecutable) {
      // this user needs help
      argv.push('--help');
    }

    // process argv
    const parsed = this.parseOptions(this.normalize(argv.slice(2)));
    const args = this.args = parsed.args;

    const result = this.parseArgs(this.args, parsed.unknown);

    // executable sub-commands
    const name = result.args[0];

    let aliasCommand = null;
    // check alias of sub commands
    if (name) {
      aliasCommand = this.commands.filter(command => command.alias() === name)[0];
    }

    if (this._execs[name] && typeof this._execs[name] !== 'function') {
      return this.executeSubCommand(argv, args, parsed.unknown);
    } else if (aliasCommand) {
      // is alias of a subCommand
      args[0] = aliasCommand._name;
      return this.executeSubCommand(argv, args, parsed.unknown);
    } else if (this.defaultExecutable) {
      // use the default subcommand
      args.unshift(this.defaultExecutable);
      return this.executeSubCommand(argv, args, parsed.unknown);
    }

    return result;
  }

  /**
   * Execute a sub-command executable.
   *
   * @param {Array} argv
   * @param {Array} args
   * @param {Array} unknown
   * @api private
   */

  executeSubCommand(argv, args, unknown) {
    args = args.concat(unknown);

    if (!args.length) this.help();
    if (args[0] === 'help' && args.length === 1) this.help();

    // <cmd> --help
    if (args[0] === 'help') {
      args[0] = args[1];
      args[1] = '--help';
    }

    // executable
    const f = argv[1];
    // name of the subcommand, link `pm-install`
    let bin = `${basename(f, path.extname(f))}-${args[0]}`;

    // In case of globally installed, get the base dir where executable
    //  subcommand file should be located at
    let baseDir, link = lstatSync(f).isSymbolicLink() ? readlinkSync(f) : f;

    // when symbolink is relative path
    if (link !== f && link.charAt(0) !== '/') {
      link = path.join(dirname(f), link);
    }
    baseDir = dirname(link);

    // prefer local `./<bin>` to bin in the $PATH
    const localBin = path.join(baseDir, bin);

    // whether bin file is a js script with explicit `.js` or `.ts` extension
    let isExplicitJS = false;
    if (exists(`${localBin}.js`)) {
      bin = `${localBin}.js`;
      isExplicitJS = true;
    } else if (exists(`${localBin}.ts`)) {
      bin = `${localBin}.ts`;
      isExplicitJS = true;
    } else if (exists(localBin)) {
      bin = localBin;
    }

    args = args.slice(1);

    let proc;
    if (process.platform !== 'win32') {
      if (isExplicitJS) {
        args.unshift(bin);
        // add executable arguments to spawn
        args = (process.execArgv || []).concat(args);

        proc = spawn(process.argv[0], args, { stdio: 'inherit', customFds: [0, 1, 2] });
      } else {
        proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
      }
    } else {
      args.unshift(bin);
      proc = spawn(process.execPath, args, { stdio: 'inherit' });
    }

    const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
    signals.forEach(signal => {
      process.on(signal, () => {
        if (proc.killed === false && proc.exitCode === null) {
          proc.kill(signal);
        }
      });
    });
    proc.on('close', process.exit.bind(process));
    proc.on('error', ({code}) => {
      if (code === 'ENOENT') {
        console.error('%s(1) does not exist, try --help', bin);
      } else if (code === 'EACCES') {
        console.error('%s(1) not executable. try chmod or run with root', bin);
      }
      process.exit(1);
    });

    // Store the reference to the child process
    this.runningCommand = proc;
  }

  /**
   * Normalize `args`, splitting joined short flags. For example
   * the arg "-abc" is equivalent to "-a -b -c".
   * This also normalizes equal sign and splits "--abc=def" into "--abc def".
   *
   * @param {Array} args
   * @return {Array}
   * @api private
   */

  normalize(args) {
    let ret = [], arg, lastOpt, index;

    for (let i = 0, len = args.length; i < len; ++i) {
      arg = args[i];
      if (i > 0) {
        lastOpt = this.optionFor(args[i - 1]);
      }

      if (arg === '--') {
        // Honor option terminator
        ret = ret.concat(args.slice(i));
        break;
      } else if (lastOpt && lastOpt.required) {
        ret.push(arg);
      } else if (arg.length > 1 && arg[0] === '-' && arg[1] !== '-') {
        arg.slice(1).split('').forEach(c => {
          ret.push(`-${c}`);
        });
      } else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
        ret.push(arg.slice(0, index), arg.slice(index + 1));
      } else {
        ret.push(arg);
      }
    }

    return ret;
  }

  /**
   * Parse command `args`.
   *
   * When listener(s) are available those
   * callbacks are invoked, otherwise the "*"
   * event is emitted and those actions are invoked.
   *
   * @param {Array} args
   * @return {Command} for chaining
   * @api private
   */

  parseArgs(args, unknown) {
    let name;

    if (args.length) {
      name = args[0];
      if (this.listeners(`command:${name}`).length) {
        this.emit(`command:${args.shift()}`, args, unknown);
      } else {
        this.emit('command:*', args);
      }
    } else {
      outputHelpIfNecessary(this, unknown);

      // If there were no args and we have unknown options,
      // then they are extraneous and we need to error.
      if (unknown.length > 0) {
        this.unknownOption(unknown[0]);
      }
      if (this.commands.length === 0 &&
          this._args.filter(({required}) => required).length === 0) {
        this.emit('command:*');
      }
    }

    return this;
  }

  /**
   * Return an option matching `arg` if any.
   *
   * @param {String} arg
   * @return {Option}
   * @api private
   */

  optionFor(arg) {
    for (let i = 0, len = this.options.length; i < len; ++i) {
      if (this.options[i].is(arg)) {
        return this.options[i];
      }
    }
  }

  /**
   * Parse options from `argv` returning `argv`
   * void of these options.
   *
   * @param {Array} argv
   * @return {Array}
   * @api public
   */

  parseOptions(argv) {
    const args = [];
    const len = argv.length;
    let literal;
    let option;
    let arg;

    const unknownOptions = [];

    // parse options
    for (let i = 0; i < len; ++i) {
      arg = argv[i];

      // literal args after --
      if (literal) {
        args.push(arg);
        continue;
      }

      if (arg === '--') {
        literal = true;
        continue;
      }

      // find matching Option
      option = this.optionFor(arg);

      // option is defined
      if (option) {
        // requires arg
        if (option.required) {
          arg = argv[++i];
          if (arg == null) return this.optionMissingArgument(option);
          this.emit(`option:${option.name()}`, arg);
        // optional arg
        } else if (option.optional) {
          arg = argv[i + 1];
          if (arg == null || (arg[0] === '-' && arg !== '-')) {
            arg = null;
          } else {
            ++i;
          }
          this.emit(`option:${option.name()}`, arg);
        // bool
        } else {
          this.emit(`option:${option.name()}`);
        }
        continue;
      }

      // looks like an option
      if (arg.length > 1 && arg[0] === '-') {
        unknownOptions.push(arg);

        // If the next argument looks like it might be
        // an argument for this option, we pass it on.
        // If it isn't, then it'll simply be ignored
        if ((i + 1) < argv.length && argv[i + 1][0] !== '-') {
          unknownOptions.push(argv[++i]);
        }
        continue;
      }

      // arg
      args.push(arg);
    }

    return { args, unknown: unknownOptions };
  }

  /**
   * Return an object containing options as key-value pairs
   *
   * @return {Object}
   * @api public
   */
  opts() {
    const result = {}, len = this.options.length;

    for (let i = 0; i < len; i++) {
      const key = this.options[i].attributeName();
      result[key] = key === this._versionOptionName ? this._version : this[key];
    }
    return result;
  }

  /**
   * Argument `name` is missing.
   *
   * @param {String} name
   * @api private
   */

  missingArgument(name) {
    console.error();
    console.error("  error: missing required argument `%s'", name);
    console.error();
    process.exit(1);
  }

  /**
   * `Option` is missing an argument, but received `flag` or nothing.
   *
   * @param {String} option
   * @param {String} flag
   * @api private
   */

  optionMissingArgument({flags}, flag) {
    console.error();
    if (flag) {
      console.error("  error: option `%s' argument missing, got `%s'", flags, flag);
    } else {
      console.error("  error: option `%s' argument missing", flags);
    }
    console.error();
    process.exit(1);
  }

  /**
   * Unknown option `flag`.
   *
   * @param {String} flag
   * @api private
   */

  unknownOption(flag) {
    if (this._allowUnknownOption) return;
    console.error();
    console.error("  error: unknown option `%s'", flag);
    console.error();
    process.exit(1);
  }

  /**
   * Variadic argument with `name` is not the last argument as required.
   *
   * @param {String} name
   * @api private
   */

  variadicArgNotLast(name) {
    console.error();
    console.error("  error: variadic arguments must be last `%s'", name);
    console.error();
    process.exit(1);
  }

  /**
   * Set the program version to `str`.
   *
   * This method auto-registers the "-V, --version" flag
   * which will print the version number when passed.
   *
   * @param {String} str
   * @param {String} [flags]
   * @return {Command} for chaining
   * @api public
   */

  version(str, flags) {
    if (arguments.length === 0) return this._version;
    this._version = str;
    flags = flags || '-V, --version';
    const versionOption = new Option(flags, 'output the version number');
    this._versionOptionName = versionOption.long.substr(2) || 'version';
    this.options.push(versionOption);
    this.on(`option:${this._versionOptionName}`, () => {
      process.stdout.write(`${str}\n`);
      process.exit(0);
    });
    return this;
  }

  /**
   * Set the description to `str`.
   *
   * @param {String} str
   * @param {Object} argsDescription
   * @return {String|Command}
   * @api public
   */

  description(str, argsDescription) {
    if (arguments.length === 0) return this._description;
    this._description = str;
    this._argsDescription = argsDescription;
    return this;
  }

  /**
   * Set an alias for the command
   *
   * @param {String} alias
   * @return {String|Command}
   * @api public
   */

  alias(alias) {
    let command = this;
    if (this.commands.length !== 0) {
      command = this.commands[this.commands.length - 1];
    }

    if (arguments.length === 0) return command._alias;

    if (alias === command._name) throw new Error('Command alias can\'t be the same as its name');

    command._alias = alias;
    return this;
  }

  /**
   * Set / get the command usage `str`.
   *
   * @param {String} str
   * @return {String|Command}
   * @api public
   */

  usage(str) {
    const args = this._args.map(arg => humanReadableArgName(arg));

    const usage = `[options]${this.commands.length ? ' [command]' : ''}${this._args.length ? ` ${args.join(' ')}` : ''}`;

    if (arguments.length === 0) return this._usage || usage;
    this._usage = str;

    return this;
  }

  /**
   * Get or set the name of the command
   *
   * @param {String} str
   * @return {String|Command}
   * @api public
   */

  name(str) {
    if (arguments.length === 0) return this._name;
    this._name = str;
    return this;
  }

  /**
   * Return prepared commands.
   *
   * @return {Array}
   * @api private
   */

  prepareCommands() {
    return this.commands.filter(({_noHelp}) => !_noHelp).map(cmd => {
      const args = cmd._args.map(arg => humanReadableArgName(arg)).join(' ');

      return [
        cmd._name +
          (cmd._alias ? `|${cmd._alias}` : '') +
          (cmd.options.length ? ' [options]' : '') +
          (args ? ` ${args}` : ''),
        cmd._description
      ];
    });
  }

  /**
   * Return the largest command length.
   *
   * @return {Number}
   * @api private
   */

  largestCommandLength() {
    const commands = this.prepareCommands();
    return commands.reduce((max, command) => Math.max(max, command[0].length), 0);
  }

  /**
   * Return the largest option length.
   *
   * @return {Number}
   * @api private
   */

  largestOptionLength() {
    const options = [].slice.call(this.options);
    options.push({
      flags: '-h, --help'
    });
    return options.reduce((max, {flags}) => Math.max(max, flags.length), 0);
  }

  /**
   * Return the largest arg length.
   *
   * @return {Number}
   * @api private
   */

  largestArgLength() {
    return this._args.reduce((max, {name}) => Math.max(max, name.length), 0);
  }

  /**
   * Return the pad width.
   *
   * @return {Number}
   * @api private
   */

  padWidth() {
    let width = this.largestOptionLength();
    if (this._argsDescription && this._args.length) {
      if (this.largestArgLength() > width) {
        width = this.largestArgLength();
      }
    }

    if (this.commands && this.commands.length) {
      if (this.largestCommandLength() > width) {
        width = this.largestCommandLength();
      }
    }

    return width;
  }

  /**
   * Return help for options.
   *
   * @return {String}
   * @api private
   */

  optionHelp() {
    const width = this.padWidth();

    // Append the help information
    return this.options.map(({flags, description, bool, defaultValue}) => `${pad(flags, width)}  ${description}${(bool && defaultValue !== undefined) ? ` (default: ${defaultValue})` : ''}`).concat([`${pad('-h, --help', width)}  output usage information`])
      .join('\n');
  }

  /**
   * Return command help documentation.
   *
   * @return {String}
   * @api private
   */

  commandHelp() {
    if (!this.commands.length) return '';

    const commands = this.prepareCommands();
    const width = this.padWidth();

    return [
      'Commands:',
      '',
      commands.map(cmd => {
        const desc = cmd[1] ? `  ${cmd[1]}` : '';
        return (desc ? pad(cmd[0], width) : cmd[0]) + desc;
      }).join('\n').replace(/^/gm, '  '),
      ''
    ].join('\n');
  }

  /**
   * Return program help documentation.
   *
   * @return {String}
   * @api private
   */

  helpInformation() {
    let desc = [];
    if (this._description) {
      desc = [
        this._description,
        ''
      ];

      const argsDescription = this._argsDescription;
      if (argsDescription && this._args.length) {
        const width = this.padWidth();
        desc.push('Arguments:');
        desc.push('');
        this._args.forEach(({name}) => {
          desc.push(`  ${pad(name, width)}  ${argsDescription[name]}`);
        });
        desc.push('');
      }
    }

    let cmdName = this._name;
    if (this._alias) {
      cmdName = `${cmdName}|${this._alias}`;
    }
    const usage = [
      `Usage: ${cmdName} ${this.usage()}`,
      ''
    ];

    let cmds = [];
    const commandHelp = this.commandHelp();
    if (commandHelp) cmds = [commandHelp];

    const options = [
      'Options:',
      '',
      `${this.optionHelp().replace(/^/gm, '  ')}`,
      ''
    ];

    return usage
      .concat(desc)
      .concat(options)
      .concat(cmds)
      .join('\n');
  }

  /**
   * Output help information for this command
   *
   * @api public
   */

  outputHelp(cb) {
    if (!cb) {
      cb = passthru => passthru;
    }
    process.stdout.write(cb(this.helpInformation()));
    this.emit('--help');
  }

  /**
   * Output help information and exit.
   *
   * @api public
   */

  help(cb) {
    this.outputHelp(cb);
    process.exit();
  }
}

/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */

function camelcase(flag) {
  return flag.split('-').reduce((str, word) => str + word[0].toUpperCase() + word.slice(1));
}

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

function pad(str, width) {
  const len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

/**
 * Output help information if necessary
 *
 * @param {Command} command to output help for
 * @param {Array} array of options to search for -h or --help
 * @api private
 */

function outputHelpIfNecessary(cmd, options = []) {
  for (let i = 0; i < options.length; i++) {
    if (options[i] === '--help' || options[i] === '-h') {
      cmd.outputHelp();
      process.exit(0);
    }
  }
}

/**
 * Takes an argument an returns its human readable equivalent for help usage.
 *
 * @param {Object} arg
 * @return {String}
 * @api private
 */

function humanReadableArgName({name, variadic, required}) {
  const nameOutput = name + (variadic === true ? '...' : '');

  return required
    ? `<${nameOutput}>`
    : `[${nameOutput}]`;
}

// for versions before node v0.8 when there weren't `fs.existsSync`
function exists(file) {
  try {
    if (statSync(file).isFile()) {
      return true;
    }
  } catch (e) {
    return false;
  }
}
