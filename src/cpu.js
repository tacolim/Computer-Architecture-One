/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT  = 0b00011011; // Halt CPU
const LDI = 0b00000100; // LDI
const ADD = 0b00001100; // ADD
const MUL = 0b00000101; // MUL
const PRN = 0b00000110; // PRINT NUM
const PUSH = 0b00001010; // PUSH
const POP = 0b00001011; // POP
const CALL = 0b00001111; // CALL
const RET = 0b00010000; // RETURN
const JMP = 0b00010001; // JMP
const ST = 0b00001001 // STORE
const INT = 0b00011001 // INTERRUPT
const IRET = 0b00011010 // INTERRUPT RETURN
const PRA = 0b000000111 // PRINT ALPHA CHAR
const CMP = 0b000010110 // COMPARE VALUES
const JEQ = 0b000010011 // JEQ REGISTER
const JNE = 0b000010100 // JNE REGISTER

const IM = 5;
const IS = 6;

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers
        
        this.reg[7] = 0xF8;

        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Instruction Register

        this.flags = {
            interruptsEnabled: true,
            overflow: false,
            equal: false
        };

		this.setupBranchTable();
    }
	
	/**
	 * Sets up the branch table
	 */
	setupBranchTable() {
		let bt = {};

        bt[HLT] = this.HLT;
        bt[LDI] = this.LDI;
        bt[MUL] = this.MUL;
        bt[ADD] = this.ADD;
        bt[PRN] = this.PRN;
        bt[PUSH] = this.PUSH;
        bt[POP] = this.POP;
        bt[CALL] = this.CALL; 
        bt[RET] = this.RET;
        bt[JMP] = this.JMP;
        bt[ST] = this.ST;
        bt[INT] = this.IRET;
        bt[IRET] = this.INT;
        bt[PRA] = this.PRA;
        bt[CMP] = this.CMP;
        bt[JEQ] = this.JEQ;
        bt[JNE] = this.JNE;

		this.branchTable = bt;
	}

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1);

        this.timerHandle = setInterval(() => {
            // Trigger timer interrupt
            // set bit 0 of IS to 1
            this.reg[IS] |= 0b00000001;
        }, 1000);
    }
    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * ALU functionality
     * 
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        let valA = this.reg[regA];
        let valB = this.reg[regB];

        switch (op) {
            case 'ADD':
                this.reg[regA] = valA + valB & 0b11111111;
                break;
            case 'MUL':
                this.reg[regA] = valA * valB & 0b11111111;
                break;
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Interrupt stuff
        
        //If it did, jump to that interrupt handler
        
        const maskedInterrupts = this.reg[IS] & this.reg[IM];


        if (this.flags.interruptsEnabled && maskedInterrupts !== 0) {
            for (let i = 0; i <= 7; i++) {
                if (((maskedInterrupts >> i) & 1) === 1) {
                    // handle interrupt
                    this.flags.interruptsEnabled = false;

                    // clear i-th bit in the IS
                    this.reg[IS] &= ~(1 << i);

                    // Push PC on stack
                    this.reg[7]--; // decrement register 7;
                    this.ram.write(this.reg[7], this.reg.PC+2);

                    // Push remaining registers on stack
                    for (let j = 0; j <= 7; j++) {
                        this.reg[7]--;
                        this.ram.write(this.reg[7], this.reg[j]);
                    }

                    // Look up the handler address in the interrupt vector table
                    const vectorTableEntry = 0xf8 + i;
                    const handlerAddress = this.ram.read(vectorTableEntry);

                    // Set PC to handler
                    this.reg.PC = handlerAddress;



                    console.log('handling interrupt! ' + i);
                    break;
                }
            }
        }

        // Load the instruction register from the current PC
        this.reg.IR = this.ram.read(this.reg.PC);
        // Debugging output
        // console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

        // Based on the value in the Instruction Register, jump to the
        // appropriate hander in the branchTable
        const handler = this.branchTable[this.reg.IR];

        // Check that the handler is defined, halt if not (invalid
        // instruction)
        if (!handler) {
            console.error(`Invalid instruction at ${this.reg.PC} : ${this.reg.IR}`);
            this.stopClock();
            return;
        }

        // We need to use call() so we can set the "this" value inside
        // the handler (otherwise it will be undefined in the handler)
        handler.call(this);
    }

    // INSTRUCTION HANDLER CODE:

    /**
     * HLT
     */
    HLT() {
        // !!! IMPLEMENT ME
        this.stopClock();
    }

    /**
     * LDI R,I
     */
    LDI() {
        // !!! IMPLEMENT ME
        const regA = this.ram.read(this.reg.PC + 1);
        const immediate  = this.ram.read(this.reg.PC + 2);

        this.reg[regA] = immediate;
        
        this.reg.PC += 3; // Move the PC

    }

    /**
     * ADD R,R
     */
    ADD() {
        // !!! IMPLEMENT ME
        const regA = this.ram.read(this.reg.PC + 1);
        const regB  = this.ram.read(this.reg.PC + 2);

        this.alu('ADD', regA, regB);
        this.reg.PC += 3; // Move the PC
    }
    /**
     * MUL R,R
     */
    MUL() {
        // !!! IMPLEMENT ME
        const regA = this.ram.read(this.reg.PC + 1);
        const regB  = this.ram.read(this.reg.PC + 2);

        this.alu('MUL', regA, regB);
        this.reg.PC += 3; // Move the PC
    }
    
    /**
     * PRN R
     */
    PRN() {
        // !!! IMPLEMENT ME
        const regA = this.ram.read(this.reg.PC + 1);
        console.log(this.reg[regA]);
        
        this.reg.PC += 2; // Move the PC
        
    }
    PRA() {
        // !!! IMPLEMENT ME
        const regA = this.ram.read(this.reg.PC + 1);
        console.log(String.fromCharCode(this.reg[regA]));
        
        this.reg.PC += 2; // Move the PC
        
    }

    PUSH() {
        // !!! IMPLEMENT ME
        const regA = this.ram.read(this.reg.PC+1);

        this.reg[7]--; // decrement register 7;
        this.ram.write(this.reg[7], this.reg[regA]);
        
        this.reg.PC += 2; // Move the PC
        
    }
    
    POP() {
        const regA = this.ram.read(this.reg.PC+1);
        
        this.reg[regA] = this.ram.read(this.reg[7]);
        
        this.reg[7]++; // increment register 7

        this.reg.PC += 2; // Move the PC
    }

    CALL() {
      this.reg[7]--; // decrement register 7;
      this.ram.write(this.reg[7], this.reg.PC+2);

      const regA = this.ram.read(this.reg.PC+1);

      this.reg.PC = this.reg[regA];

    }

    RET() {        
        this.reg.PC = this.ram.read(this.reg[7]);
        
        this.reg[7]++;

    }

    JMP() {
        const regA = this.ram.read(this.reg.PC+1);

        this.reg.PC = this.reg[regA];
    }

    ST() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB  = this.ram.read(this.reg.PC + 2);

        this.ram.write(this.reg[regA], this.reg[regB]);

        this.reg.PC += 3;
    }
    
    INT() {
        const regA = this.ram.read(this.reg.PC + 1);
    }
    
    IRET() {        
        // Pop registers off stack
        for (let j = 7; j >= 0; j--) {
            this.reg[j] = this.ram.read(this.reg[7]);
            this.reg[7]++;
        }
        
        // Pop PC off stack
        this.reg.PC = this.ram.read(this.reg[7]);
        this.reg[7]++;
        
        this.flags.interruptsEnabled = true;
    }

    CMP() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB  = this.ram.read(this.reg.PC + 2);
        if (this.reg[regA] === this.reg[regB]) {
            this.flags.equal = true;
        } else { this.flags.equal = false };
        this.reg.PC += 3;
        
    }
    JEQ() {
        const regA = this.ram.read(this.reg.PC + 1);
        if (this.flags.equal === true) {
            this.reg.PC = this.reg[regA];
        }
        else { this.reg.PC += 2}
        
    }
    JNE() {
        const regA = this.ram.read(this.reg.PC + 1);
        if (this.flags.equal === false) {
            this.reg.PC = this.reg[regA];
        }
        else { this.reg.PC += 2}
    }
}

module.exports = CPU;
