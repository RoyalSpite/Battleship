import { gameWidth, gameHeight, cellsize, explosion_size, 
    fontStyle, Main_MenuButton , cardHeight, cardWidth } from "./util_functions.js"

const x = 150
const y = 90

export class Menu extends Phaser.Scene{

    constructor(){
        super({key : "Menu"})
    }

    preload(){

        this.load.image('Battleship','src/sprites/Battleship.png')
        this.load.image('Cruiser','src/sprites/Cruiser.png')
        this.load.image('Gunboat','src/sprites/Gunboat.png')
        this.load.image('Fort','src/sprites/Fort.png')

        this.load.image('cardclose','src/sprites/close.png')
        this.load.image('backtomenu','src/sprites/back_to_menu.png')
        this.load.image('instruction','src/sprites/instruction_button.png')
        this.load.image('instrction_card','src/sprites/instruction_card.png')

        this.load.audio('explosion','src/sfx/explosion.wav')
        this.load.audio('hit','src/sfx/hit.wav')
        this.load.audio('shoot','src/sfx/shoot.wav')
        this.load.audio('win','src/sfx/victory.wav')
        this.load.audio('lose','src/sfx/defeat.wav')
        this.load.audio('playgame','src/sfx/playgame.wav')
        this.load.audio('planningOn','src/sfx/planning_mode_on.wav')

        this.load.spritesheet('marked','src/sprites/marked.png',{
            frameWidth : cellsize , frameHeight : cellsize
        })

        this.load.spritesheet('explode','src/sprites/explosion.png',{
            frameWidth : explosion_size , frameHeight : explosion_size
        })

        this.load.spritesheet('howtoplay','src/sprites/howtoplay_cards.png',{
            frameWidth : (cardWidth + 40), frameHeight : cardHeight
        })

        this.load.spritesheet('howtoplaybuttons','src/sprites/howtoplay_buttons.png',{
            frameWidth : cellsize - 35, frameHeight : cellsize - 15
        })

        this.load.spritesheet('sfx','src/sprites/sfx_button.png',{
            frameWidth : cellsize, frameHeight : cellsize
        })

    }

    create(){

        this.sfx_on = true

        this.ai_diff = 0

        this.title = this.add.text(x,y,"Battleships",fontStyle(80))
            .setOrigin(0,0)

        this.play = new Main_MenuButton(this,x,y + 175,"PLAY",() => {
            this.scene.sleep('Menu')
            this.scene.launch('Planning',{
                sfx_on : this.sfx_on,
                difficulty : this.ai_diff
            })
        })

        this.howto = new Main_MenuButton(this,x,y + 250,"HOW TO PLAY",() => {
            this.scene.pause('Menu')
            this.scene.launch('HowToPlay')
        })
        
        this.diff_text = this.add.text(x + 240,y + 320,"",fontStyle(30)).setOrigin(0.5)
        this.setAIDiffText()

        this.diff = new Main_MenuButton(this,x,y + 320,"DIFFICULTY : ",() =>{
            if(this.ai_diff === 2) this.ai_diff = 0
            else this.ai_diff++

            this.setAIDiffText()
        })

        this.sfx_toggle = this.add.sprite(gameWidth - 90, 50,'sfx'
            ,(this.sfx_on)? 1:0).setInteractive()

        this.sfx_toggle.on(
            Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                if(pointer.leftButtonDown()){
                    this.sfx_on = !this.sfx_on
                    this.sfx_toggle.setFrame((this.sfx_on)? 1:0)
                }
            }
        )
    }

    setAIDiffText(){
        let text = ""
        switch(this.ai_diff){
            case 0:{
                text = "EASY"
                break
            }
            case 1:{
                text = "NORMAL"
                break
            }
            case 2:{
                text = "HARD"
                break
            }
        }

        this.diff_text.setText(text)
    }

}