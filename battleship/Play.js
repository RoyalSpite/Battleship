import { Random_AI } from "./Easy_Agent.js"
import { generate_board } from "./generate_board.js"
import { Probabilistic_Agent } from "./Hard_Agent.js"
import { Hunt_and_Target_AI } from "./Normal_Agent.js"
import { cellsize, ships, gameHeight, gameWidth, gridnum ,_create_grid, GameOver_Button, fontStyle, cardWidth, cardHeight } from "./util_functions.js"

const player_center_x = gameWidth/4
const enemy_center_x = gameWidth/4  + gameWidth/2
const center_y = gameHeight/2 + 60

export class Play extends Phaser.Scene{

    constructor(){
        super({ key : "Play"})
    }

    init(data){
        console.log('game start')
        // ========== set if sfx play ========== //
        this.sfx_on = data.sfx_on
        this.ai_diff = data.difficulty
        this.player_ = data.gamedata

        let ai_text = ""

        if(data.difficulty === 1){ 
            ai_text = "NORMAL"
            this.enemy_agent = new Hunt_and_Target_AI()
        }
        else if(data.difficulty === 2){ 
            ai_text = "HARD"
            this.enemy_agent = new Probabilistic_Agent()
        }
        else{ 
            ai_text = "EASY"
            this.enemy_agent = new Random_AI()
        }
        
        this.add.text(gameWidth/2,25,"AI MODE : "+ai_text,fontStyle(25)).setOrigin(0.5)
    }

    create(){
        if(this.sfx_on) this.sound.play('playgame')

        this.explosion_layer = { 
            player : this.add.layer().setDepth(3),
            enemy : this.add.layer().setDepth(3),
        }

        // ========== set player attributes ========== //
        this.player_active = true
        this.player_current_position = undefined
        this.player_grid = this.add.layer().setDepth(1)
        this.enemy_ships_remaining = [...ships]
        // console.log("player_board")
        // this.player_ = generate_board()
        this.player_color = 0x0000ff
        this.player_ships_visual = this.add.layer().setDepth(2)
        this.player_grid_visual = _create_grid(this, player_center_x, center_y)
        // ========== set player attributes ========== //

        // ========== set enemy attributes ========== //
        this.enemy_grid = this.add.layer().setDepth(1)
        // console.log("enemy_board")
        this.enemy_ = generate_board()
        this.enemy_color = 0xff0000
        this.enemy_ships_visual = this.add.layer().setDepth(2)

        this.enemy_grid_visual = _create_grid(this, enemy_center_x, center_y)
        this.enemy_lock_on = this.add.image(
            0,0, 'marked', 1
        ).setDepth(6).setVisible(false)
        // ========== set enemy attributes ========== //

        // console.log("player_board")
        // console.log(this.player_)

        // console.log("enemy_board")
        // console.log(this.enemy_)

        // ========== display texts ========== //

        const y_text = 50

        this.add.text(45,y_text,["Enemy","ships remaining :"],
            fontStyle(25,'#ff0000')
        ).setOrigin(0,0.5).setAlign('left')

        this.enemy_remaining_text =  this.add.text(45,y_text + 35, this.enemy_agent.player_ships_remaining.length+"" ,
            fontStyle(40,'#ff0000')
        ).setOrigin(0,0).setAlign('left')

        this.add.text(955,y_text,["Player",": ships remaining"],
            fontStyle(25,'#0000ff')
        ).setOrigin(1,0.5).setAlign('right')

        this.player_remaining_text =  this.add.text(955,y_text + 35, this.enemy_ships_remaining.length+"" ,
            fontStyle(40,'#0000ff')
        ).setOrigin(1,0).setAlign('right')
        // ========== display texts ========== //
        
        //set ships
        for(let s = 0;s<ships.length;s++){

            this.setShip(this.enemy_ships_visual,this.enemy_.ship[s],true)

            this.setShip(this.player_ships_visual,this.player_.ship[s],false)

        }

        for(let i=0;i<gridnum;i++){
            for(let j=0;j<gridnum;j++){
                
                const p_x = player_center_x - (cellsize * (gridnum/2)) + (cellsize/2) + (cellsize * (j))
                const e_x = enemy_center_x - (cellsize * (gridnum/2)) + (cellsize/2) + (cellsize * (j))

                const y = center_y - (cellsize * (gridnum/2)) + (cellsize/2) + (cellsize * (i))

                this.player_grid.add(
                    this.add.image(
                        p_x, y, 'marked', 0
                    ).setInteractive()
                )
                this.setExplosion(p_x,y,this.explosion_layer.player)

                this.enemy_grid.add(
                    this.add.image(
                        e_x, y, 'marked', 0
                    )
                )
                this.setExplosion(e_x,y,this.explosion_layer.enemy)

                this.player_grid.getChildren()[j + (i * gridnum)].on(
                    Phaser.Input.Events.POINTER_OVER, () =>{
                        this.player_current_position = {
                            x : j,
                            y : i
                        }
                        if(this.player_active === true){
                            if(this.enemy_.board[i][j] >= 0){
                                this.player_grid.getChildren()[j + (i * gridnum)].setFrame(1)
                            }
                        }
                    }
                )

                this.player_grid.getChildren()[j + (i * gridnum)].on(
                    Phaser.Input.Events.POINTER_OUT, () =>{
                        this.player_current_position = undefined
                        if(this.player_active === true){
                            if(this.enemy_.board[i][j] >= 0){
                                this.player_grid.getChildren()[j + (i * gridnum)].setFrame(0)
                            }
                        }
                    }
                )

                this.player_grid.getChildren()[j + (i * gridnum)].on(
                    Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                        if(this.player_active === true){
                            if(pointer.leftButtonDown()){
                                const status = this.fire(
                                    i,j,
                                    this.player_grid.getChildren()[j + (i * gridnum)],
                                    this.enemy_.board,
                                    this.enemy_,
                                    this.enemy_ships_visual,
                                    this.explosion_layer.player,
                                    true
                                )

                                if(status.result === 0) this.player_active = false
                                if(status.result === 2){

                                    this.enemy_ships_remaining.splice(
                                        this.enemy_ships_remaining.indexOf( status.shipData,1 )
                                    )

                                    this.enemy_remaining_text.setText(this.enemy_ships_remaining.length)

                                }
                            }
                        }
                    }
                )
            }
        }

        //add explosion animation
        this.anims.create({
            key : 'explode',
            frames : this.anims.generateFrameNames('explode'),
            frameRate : 17,
            repeat : 0
        })

    }

    update(){

        if(this.player_active !== undefined){
            if(this.player_active === false){

                this.enemy_grid_visual.getChildren()[1].setStrokeStyle(2,this.enemy_color)
                this.enemy_grid_visual.getChildren()[2].setStrokeStyle(2,this.enemy_color)

                this.player_grid_visual.getChildren()[1].setStrokeStyle(2,0xffffff)
                this.player_grid_visual.getChildren()[2].setStrokeStyle(0,0xffffff)

                //enemy's turn
                let i,j
                let status
                if(this.enemy_agent.time === 60){

                    this.enemy_agent.time = 0
                    i = this.enemy_agent.y
                    j = this.enemy_agent.x
                    this.enemy_lock_on.setVisible(false)

                    status = ( 
                        this.fire(
                            i,j,
                            this.enemy_grid.getChildren()[j + (i * gridnum)],
                            this.player_.board,
                            this.player_,
                            this.player_ships_visual,
                            this.explosion_layer.enemy,
                            false
                        )
                    )

                    if( this.player_active !== undefined && status.result === 0 ) this.player_active = true
                    


                    if( status !== undefined ){

                        this.enemy_agent.getFeedback(status,this.player_.board)

                        this.enemy_agent.choose_target(this.player_.board)
                    }
                    
                    if(status.result === 2){
                        this.player_remaining_text.setText(this.enemy_agent.player_ships_remaining.length)
                    }
                    
                }
                else{

                    if(this.enemy_agent.x === undefined && this.enemy_agent.y === undefined){
                        this.enemy_agent.choose_target(this.player_.board)
                    }

                    i = this.enemy_agent.y
                    j = this.enemy_agent.x

                    const e_x = enemy_center_x - (cellsize * (gridnum/2)) + (cellsize/2) + (cellsize * (j))

                    const y = center_y - (cellsize * (gridnum/2)) + (cellsize/2) + (cellsize * (i))

                    //lock target
                    this.enemy_lock_on.setPosition(e_x,y).setVisible(true)
                    //this.enemy_grid.getChildren()[j + (i * gridnum)].setFrame(1)

                    this.enemy_agent.time++
                }
                
            }
            else{
                this.player_grid_visual.getChildren()[1].setStrokeStyle(2,this.player_color)
                this.player_grid_visual.getChildren()[2].setStrokeStyle(2,this.player_color)

                this.enemy_grid_visual.getChildren()[1].setStrokeStyle(2,0xffffff)
                this.enemy_grid_visual.getChildren()[2].setStrokeStyle(0,0xffffff)

                if((this.player_current_position !== undefined) && (this.player_active === true)){

                    const j = this.player_current_position.y
                    const i = this.player_current_position.x

                    if(this.enemy_.board[j][i] >= 0)
                    this.player_grid.getChildren()[
                        i + (j * gridnum)
                    ].setFrame(1)
                }
            }
        }

    }

    setShip(layer,info,forPlayer){

        const ship_x = ((!forPlayer)? enemy_center_x : player_center_x) 
            - (cellsize * (gridnum/2)) + (cellsize/2) + (cellsize * (
            info.x
        ))

        const ship_y = center_y - (cellsize * (gridnum/2)) + (cellsize/2) + (cellsize * (
            info.y
        )) + ((info.align === 0)? cellsize:0)

        layer.add(
            this.add.image(
                ship_x - (cellsize/2), 
                ship_y - (cellsize/2),
                info.name
            ).setOrigin(0,0).setTint((forPlayer)? this.enemy_color : this.player_color).setAngle(
                (info.align === 0)? -90:0
            ).setVisible(!forPlayer)
        )
    }

    setExplosion(x,y,layer){
        layer.add(
            this.add.sprite(
                x,y,
                'explode'
            ).setVisible(false).setScale(1.5)
        )
    }

    fire(i,j,cell,board,info,shiplayer,explayer,isPlayer){

        const val = board[i][j]
        let result,index

        if(val >= 0){

            if(val === 0){

                //miss
                result = 0
                cell.setFrame(2)
                if(this.sfx_on) this.sound.play('shoot')
                this.marked(i,j,board)
            }
            else if(val > 0){

                //hit
                result = 1
                index = val - 1
                cell.setFrame(3)
                info.ship[index].remainblock--
                info.remaining--

                if(this.sfx_on) this.sound.play('hit')

                const x = info.ship[index].x
                const y = info.ship[index].y
                const length = info.ship[index].block
                const align = info.ship[index].align

                if(info.ship[index].remainblock === 0){

                    result = 2
                    if(isPlayer){
                        shiplayer.getChildren()[ index ].setVisible(true)
                    }
                    else{
                        shiplayer.getChildren()[ index ].setTint(0x000d1a)
                    }

                    if(info.remaining !== 0){
                        //play explosion
                        if(align === 0){
                            const x_lim = x + length - 1

                            for(let j=x ; j<=x_lim ; j++){
                                explayer.getChildren()[j + (y * gridnum)]
                                    .setVisible(true).play('explode')
                            }
                        }
                        else{
                            const y_lim = y + length - 1

                            for(let i=y ; i<=y_lim ;i++){
                                explayer.getChildren()[x + (i * gridnum)]
                                    .setVisible(true).play('explode')
                            }
                        }
                        
                        if(this.sfx_on) this.sound.play('explosion')
                    }
                    else{
                        //game over
                        this.gameover(isPlayer)
                    }
                }
                this.marked(i,j,board)
                
            }

        }
        
        return {
            result : result,
            shipData : (index !== undefined)? info.ship[index] : -1
        }

    }

    marked(i,j,board){
        board[i][j] = -1
    }

    gameover(isPlayerWin){
        
        this.player_active = undefined

        let text = ""
        let gameover_sound

        if(isPlayerWin){
            text = "YOU WIN!!!"
            gameover_sound = this.sound.add('win')
        }
        else{
            text = "YOU LOSE!!!"
            gameover_sound = this.sound.add('lose')
        }

        if(this.sfx_on) gameover_sound.play()

        const announce_text = this.add.text(0,-50,text,
            fontStyle(60)
        ).setAlign('center').setOrigin(0.5)

        const button1 = new GameOver_Button(this,-150,100,"RESTART",() => {
            gameover_sound.stop()
            this.scene.restart()
            this.clearBoard(this.player_)
        })

        const button2 = new GameOver_Button(this,150,100,"EXIT",() => {
            gameover_sound.stop()
            this.scene.wake('Menu')
            this.scene.stop('Play')
            
        })

        this.add.container(
            gameWidth/2,
            gameHeight/2,
            [
                this.add.rectangle(
                    0 ,0 ,cardWidth ,cardHeight ,0x000000,1
                ).setStrokeStyle(3,0xffffff),
                announce_text,
                button1,
                button2
            ]
        ).setDepth(6).setSize(300,300)

    }

    clearBoard(elem){
        for(let i=0;i<gridnum;i++){
            for(let j=0;j<gridnum;j++){
                elem.board[i][j] = 0
            }
        }

        elem.remaining = 0

        for(let i=0;i<ships.length;i++){
            
            let start
            let finish

            if(elem.ship[i].align === 1){

                //vertical
                start = elem.ship[i].y
                finish = start + elem.ship[i].block - 1

                for(let _y = start ; _y <= finish ; _y++){
                    elem.board[_y][ elem.ship[i].x ] = i + 1
                }

            }
            else{

                start = elem.ship[i].x
                finish = start + elem.ship[i].block - 1

                for(let _x = start ; _x <= finish ; _x++){
                    elem.board[ elem.ship[i].y ][_x] = i + 1
                }

            }

            elem.ship[i].remainblock = elem.ship[i].block
            elem.remaining += elem.ship[i].block
            
        }

    }

}