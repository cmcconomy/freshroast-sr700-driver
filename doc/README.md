# SR700 Driver Documentation

## UML Diagrams
Unified Modeling Language (UML) Diagrams can be found under the uml/ folder, and are written in [PlantUML](http://plantuml.com/) format, which is a plain text format.

### Generating Pretty Output
To generate pretty UML output, the following install all the [PlantUML requirements]() issue the following command:
`java -jar lib/plantuml.jar uml/serial-communication_sequence.txt` (or parse whichever document you want)
to output text to command line:
`cat uml/serial-communication_sequence.txt | java -jar lib/plantuml.jar -pipe -tutxt`
