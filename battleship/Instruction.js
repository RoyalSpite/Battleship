import { gameWidth, gameHeight, closeButton } from "./util_functions.js";

export class Instruction extends Phaser.Scene{

    constructor(){
        super({ key : "Instruction"})
    }

    init(data){
        this.layer = data.newLayer
    }

    create(){

        const cardWidth = 600
        const cardHeight = 400

        const InstrctionContainer = this.add.container(gameWidth/2,gameHeight/2)

        const InstrctionCard = this.add.image(0,0,'instrction_card')

        const InstructionClose = new closeButton(
            this, cardWidth/2 - 35, -(cardHeight/2 - 30),
            () =>{
                InstrctionContainer.setVisible(false)
                this.scene.pause('Instruction')
                this.scene.resume('Planning')
            }
        )

        InstrctionContainer.add([
            InstrctionCard,
            InstructionClose
        ])

        this.layer.add(InstrctionContainer)


    }

}