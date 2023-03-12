import { get_name } from "./generate_board.js"
import { create_planning_board, ships, gameWidth, gameHeight
    , cellsize, gridnum, Planning_Button, Shipbutton  } from "./util_functions.js"

const button_height = 50

const gridx_loc = gameWidth/2 + 180
const gridy_loc = gameHeight/2 - 20

export class Planning extends Phaser.Scene{

    constructor(){
        super({ key : "Planning" })
    }

    init(data){

        this.sfx_on = data.sfx_on
        this.difficulty = data.difficulty

        //board
        const grid_visual = create_planning_board(this,gridx_loc,gridy_loc)

        this.graphics = this.add.graphics()
        this.ships_placed = ships.length

        this.board = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ]
        
        //ships for placing into board
        this.ship_buttons_layer = this.add.layer()
        this.ship_current_data = undefined
        this.ship_current_position = undefined
        this.ship_visual_highlight = []
        this.ship_visual_layer = this.add.layer()

        this.ship_all_info = [
            undefined, undefined, undefined,
            undefined, undefined, undefined
        ]
             
    }

    create(){

        this.planning_entry_sound = this.sound.add('planningOn')
        
        if(this.sfx_on) this.planning_entry_sound.play()

        const length =  (cellsize * gridnum - button_height) 

        //select ship buttons
        for(let i=0;i<ships.length;i++){

            const place_y = gridy_loc - (cellsize * 4) + button_height/2

            this.ship_buttons_layer.add(
                new Shipbutton(this,gameWidth/4,place_y + (Math.floor(length/(ships.length - 1)) * i),
                    get_name(ships[i]),i + 1, ships[i]
                )
            )

            this.ship_visual_layer.add(
                this.add.image(
                    0,0,get_name(ships[i])
                ).setOrigin(0,0).setTint(0x0000ff).setVisible(false)
            )

            this.ship_visual_highlight.push({
                is_place : false,
                highlight : undefined
                }
            )

        }

        this.grid = this.add.layer().setDepth(0)
        
        //grid for place ships
        
        for(let i=0;i<gridnum;i++){
            for(let j=0;j<gridnum;j++){

                const place_x = calX(j)
                const place_y = calY(i)

                let cell = this.add.rectangle(
                    place_x,place_y,
                    cellsize, cellsize
                ).setInteractive()
                
                this.grid.add(cell)

                cell.on(
                    Phaser.Input.Events.POINTER_OUT, () =>{
                        this.ship_current_position = undefined
                        this.graphics.clear()
                    }
                )

                cell.on(
                    Phaser.Input.Events.POINTER_OVER, () =>{
                        if(this.ship_current_data !== undefined){
                            this.display_highlight(j,i,this.ship_current_data.rank)
                        }
                    }
                )

                cell.on(
                    Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                        if(this.ship_current_data !== undefined){

                            const index = this.ship_current_data.rank - 1
                            const current_rect = this.ship_visual_highlight[index]

                            if(pointer.rightButtonDown() && (this.ship_current_data.length > 1)){                    

                                const length = this.ship_current_data.length
                               
                                let x = j
                                let y = i

                                this.ship_current_data.align = (this.ship_current_data.align === 0)? 1 : 0
                                    
                                current_rect.highlight.setSize(
                                    current_rect.highlight.height,current_rect.highlight.width
                                )

                                this.display_highlight(
                                    x,y,
                                    this.ship_current_data.rank
                                )

                            }
                            else if(pointer.leftButtonDown() && this.check_place_valid(current_rect.highlight)){
                                
                                //place
                                this.place_ship(
                                    this.ship_current_position.x,
                                    this.ship_current_position.y,
                                    index
                                )

                                this.graphics.clear()

                            }
                            else console.log("Invalid")
                            
                        }
                    }
                )

            }
        }
    
        const y_lower_button = gridy_loc + (cellsize * 5)

        this.ship_buttons_layer.add(
            [
                new Planning_Button(this,gridx_loc + 120,y_lower_button,"Play",false,
                    () => {
                        if(this.sfx_on) this.planning_entry_sound.stop()
                        this.scene.stop('Planning')
                        this.scene.start('Play',{                                
                            sfx_on : this.sfx_on,
                            gamedata : {
                                ship : this.ship_all_info,
                                board : this.board,
                                remaining : 15
                            },
                            difficulty : this.difficulty
                            
                        })                    
                    },
                    (button) =>{
                        if(this.ships_placed === 0){
                            button.enable = true
                        }
                        else button.enable = false
                    }
                ),
                new Planning_Button(this,gridx_loc - 120,y_lower_button,"Random",true,
                    () => {
                        console.log("Random")
                        let allPlaced = true
                        for(let i=0;i<ships.length;i++){
                            
                            if(this.ship_visual_highlight[i].is_place === false){

                                //place remaining ships into board
                                allPlaced = false
                                this.random_place_ship(i)

                            }

                        }
                        //if all ships are placed, it will resuffle
                        if(allPlaced === true){
                            this.clear_board()
                            for(let i=0;i<ships.length;i++){
                                this.random_place_ship(i)
                            }
                        }
                    }
                )
            ]
        )

        this.backToMenuButton = this.add.image(140,y_lower_button,'backtomenu').setInteractive()

        this.backToMenuButton.on(
            Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                if(pointer.leftButtonDown()){
                    this.instruction_card = undefined
                    this.planning_entry_sound.stop()
                    this.scene.wake('Menu')
                    this.scene.stop('Planning')
                    
                }
            }
        )

        this.planning_instruction = this.add.image(
            gameWidth - 75,50,'instruction'
        ).setInteractive(new Phaser.Geom.Circle(20,20,20),Phaser.Geom.Circle.Contains)

        this.planning_instruction.on(
            Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                if(pointer.leftButtonDown()){
                    this.scene.pause('Planning')
                    this.scene.launch('Instruction',{
                        newLayer : this.add.layer()
                    })
                }
            }
        )
    }

    update(){

        if(this.ships_placed === 0){
            if(this.ship_buttons_layer.getChildren()[6].enable === false){
                this.ship_buttons_layer.getChildren()[6].enable = true
                this.ship_buttons_layer.getChildren()[6].out()
            }
        }
        else{ 
            this.ship_buttons_layer.getChildren()[6].enable = false
            this.ship_buttons_layer.getChildren()[6].disable()
        }

    }

    display_highlight(x,y,rank){

        let _x = x
        let _y = y
        const length = this.ship_current_data.length

        if(this.ship_current_data.align === 1){
            if((_y + length - 1) >= gridnum) _y = gridnum - length
        }
        else{
            if((_x + length - 1) >= gridnum) _x = gridnum - length
        }

        this.ship_current_position = {
            x : _x,
            y : _y
        }

        const current_rect = this.ship_visual_highlight[rank - 1]

        current_rect.highlight.setPosition(
            calX(_x) - cellsize/2 ,calY(_y) - cellsize/2
        )

        this.graphics.clear()

        let color = (this.check_place_valid(current_rect.highlight))? 0xffffff : 0xff0000

        this.graphics.fillStyle(color,0.5)

        this.graphics.fillRectShape(current_rect.highlight)
    }

    check_place_valid(current_rect){

        for(let i=0;i<ships.length;i++){
            if(this.ship_visual_highlight[i].is_place === true){
                if(Phaser.Geom.Intersects.RectangleToRectangle(
                    current_rect,this.ship_visual_highlight[i].highlight
                )){
                    return false
                }
            }
        }
        return true

    }

    remap_board(ship,rank){

        //place ship
        let start
        let finish

        if(ship.align === 1){

            //vertical
            start = ship.y
            finish = start + ship.block - 1

            for(let _y = start ; _y <= finish ; _y++){
                this.board[_y][ ship.x ] = rank
            }

        }
        else{

            start = ship.x
            finish = start + ship.block - 1

            for(let _x = start ; _x <= finish ; _x++){
                this.board[ ship.y ][_x] = rank
            }

        }
    }

    place_ship(x,y,index){

        this.ships_placed--

        const current_rect = this.ship_visual_highlight[index]
        const current_ship = this.ship_visual_layer.getChildren()[index]

        current_rect.is_place = true
        current_rect.highlight.setPosition(
            calX(x) - cellsize/2 + 5, calY(y) - cellsize/2 + 5
        )

        current_rect.highlight.setSize(
            current_rect.highlight.width - 10,//+ cellsize,
            current_rect.highlight.height - 10// + cellsize
        )

        if(this.ship_current_data.length === 1){
            if(this.ship_current_data.align === 0){
                this.ship_current_data.align = 1
            }
        }

        this.ship_all_info[index] = {
            name : this.ship_buttons_layer.getChildren()[index].name,
            align : this.ship_current_data.align,
            x : x,
            y : y,
            block : ships[index],
            remainblock : ships[index]
        }

        // console.log(this.ship_all_info[index])
        // console.log(this.board)

        current_ship
            .setVisible(true)
            .setPosition(
                calX(x) - cellsize/2,
                calY(y) - cellsize/2 + ((this.ship_current_data.align === 1)? 0: cellsize)
            )
            .setAngle(
                (this.ship_current_data.align === 1)? 0:-90
            )
    

        this.remap_board(this.ship_all_info[index],this.ship_current_data.rank)
        this.ship_buttons_layer.getChildren()[index].place()

        this.ship_current_data = undefined
        this.ship_current_position = undefined
        
    }

    clear_board(){
        for(let i=0;i<ships.length;i++){
            this.ship_buttons_layer.getChildren()[i].cancel_place(this)
        }
    }

    random_place_ship(index){
        while(true){
                                    
            const cood = find_coord(ships[index])
            const test_width = ((cood.align === 1)? cellsize : cellsize * (ships[index]))
            const test_height = ((cood.align === 0)? cellsize : cellsize * (ships[index]))

            const testarea = new Phaser.Geom.Rectangle(
                calX(cood.x) - cellsize/2 , calY(cood.y) - cellsize/2, 
                test_width, test_height
            )

            if(this.check_place_valid(testarea)){

                this.ship_current_data = {
                    align : cood.align,
                    length : ships[index],
                    rank  : index + 1
                }

                this.ship_visual_highlight[index] = {
                    is_place : false,
                    highlight : testarea
                }

                this.place_ship(cood.x, cood.y,this.ship_current_data.rank - 1)

                this.ship_buttons_layer.getChildren()[index].is_select = true

                break

            }
            else continue
            
        }
    }

}

const calX = (i) => gridx_loc - (cellsize * 4) + (cellsize * i) + 0.5  + cellsize/2
const calY = (i) => gridy_loc - (cellsize * 4) + (cellsize * i) + 0.5  + cellsize/2

const find_coord = (length) =>{

    while(true){

        let heading =  Math.floor(Math.random() * 2)

        //ramdom head coordinate
        let head_coordinate  = {
            x : Math.floor(Math.random() * gridnum),
            y : Math.floor(Math.random() * gridnum)
        }

        let tail_coordinate = {
            x : 0, y : 0
        }

        if(heading === 0){
            //create coordinate horizontal
            tail_coordinate.x = head_coordinate.x + length - 1
            tail_coordinate.y = head_coordinate.y          
        }
        else if(heading === 1){
            //create coordinate vertical
            tail_coordinate.x = head_coordinate.x
            tail_coordinate.y = head_coordinate.y + length - 1 
        }
        
        //check if position is not place off board
        if((tail_coordinate.x > (gridnum - 1)) || (tail_coordinate.y > (gridnum - 1))){
            continue   
        }
        
        return {
            align : heading,
            x : head_coordinate.x,
            y : head_coordinate.y
        }
    }

}