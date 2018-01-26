# Binary, Decimal, and Hex
## Complete the following problems:

### Convert 11001111 binary

`to hex:` CF

`to decimal:` 207

### Convert 4C hex

`to binary:` 01001100

`to decimal:` 76

### Convert 68 decimal

`to binary:` 0100 0100

`to hex:` 44

# Architecture
## One paragraph-ish:

### Explain how the CPU provides concurrency:
When multiple processes need to be handled by a single CPU, they are handled by a system of interrupts.  Each process maintains its own thread of execution. When the CPU switches between processes one thread will be temporarily interrupted and another starts or resumes where it left off.

### Describe assembly language and machine language:
* Machine Language - actual bits used to control the CPU; processer reads these instructions in from program memory; this is a way of entering instructions via binary
* Assembly Language - more human readable; instead of representing the machine language as numbers the instructions and registers are given names; still very close to machine language

### Suggest the role that graphics cards play in machine learning:
GPUs were originally designed to do math in parallel for video games; this ability to do a lot of work in parallel at high speeds can be adapted to machine learning