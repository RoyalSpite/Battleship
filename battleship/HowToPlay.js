import { cardWidth, cardHeight, gameWidth, gameHeight, closeButton } from "./util_functions.js"

export class HowToPlay extends Phaser.Scene{


    constructor(){
        super({ key : "HowToPlay" })
    }
    
    create(){

        this.howtoplay_frame = 0

        const x_buttons = (cardWidth/2) - 5

        const HowToPlayContainer = this.add.container(gameWidth/2, gameHeight/2)

        const HowToPlayCard = this.add.image(0,0,'howtoplay').setName('Card')

        const HowToPlayPreviousPage = this.add.image(-(x_buttons),0,'howtoplaybuttons',0)
            .setInteractive()

        HowToPlayPreviousPage.on(
            Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                if(this.howtoplay_frame > 0 && pointer.leftButtonDown()){ 
                    this.howtoplay_frame--
                }
                HowToPlayCard.setFrame(this.howtoplay_frame)
            }
        )

        const HowToPlayNextPage = this.add.image(x_buttons,0,'howtoplaybuttons',1)
            .setInteractive()

        HowToPlayNextPage.on(
            Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                if(this.howtoplay_frame < 2 && pointer.leftButtonDown()){ 
                    this.howtoplay_frame++
                }
                HowToPlayCard.setFrame(this.howtoplay_frame)
            }
        )

        const HowToPlayClose = new closeButton(
            this, x_buttons - 5,-(cardHeight/2) + 30,
            () =>{
                this.howtoplay_frame = 0
                HowToPlayContainer.setVisible(false)
                this.scene.pause('HowToPlay')
                this.scene.resume('Menu')
            }
        )

        HowToPlayContainer.add(
            [
                HowToPlayCard,
                HowToPlayPreviousPage,
                HowToPlayNextPage,
                HowToPlayClose
            ]
        )

    }
}
