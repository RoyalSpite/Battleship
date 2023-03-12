export const cellsize = 50
export const explosion_size = 64
export const gridnum = 8

export const gameWidth = 1000
export const gameHeight = 600

export const cardWidth = (gameWidth/2 + 100)
export const cardHeight = (gameHeight/2 + 50)

const gridcolor = 0xffffff


export const ships = [4,3,3,2,2,1]

//check if ship not touch with others before place
export const check_border = (x,y,length,align,board) =>{

    let s_x, s_y
    let e_x, e_y

    s_x = Math.max(x - 1,0)
    s_y = Math.max(y - 1,0)

    if(align === 'horizontal'){

        if((x + length - 1) > (gridnum - 1)) return false

        e_x = Math.min(x + length - 1, gridnum - 1)
        e_y = Math.min(y + 1, gridnum - 1)

    }
    else if(align === 'vertical'){

        if((y + length - 1) > (gridnum - 1)) return false

        e_x = Math.min(x + 1, gridnum - 1)
        e_y = Math.min(y + length - 1, gridnum - 1)

    }

    for(let i= s_y ; i <= e_y ; i++ ){

        for(let j = s_x ; j <= e_x ; j++){
            if(board[i][j] !== 0) return false
        }

    }

    return true

}

export const _create_grid = (scene,x,y) =>{
    return (
        scene.add.layer(

            [
                scene.add.grid(x,y
                    ,cellsize * gridnum ,cellsize * gridnum 
                    ,cellsize, cellsize).setOutlineStyle(gridcolor,0.5)
                ,
                scene.add.rectangle(
                    x, y, cellsize * gridnum , cellsize * gridnum
                ).setStrokeStyle(2,gridcolor)
                ,
                scene.add.rectangle(
                    x, y,(cellsize * gridnum) + 15, (cellsize * gridnum) + 15
                ).setStrokeStyle(2,gridcolor)
            ]

        ).setDepth(0)
    )
}

export const create_planning_board = (scene,x,y) =>{
    return (
        scene.add.layer(

            [
                scene.add.grid(x,y
                    ,cellsize * gridnum ,cellsize * gridnum 
                    ,cellsize, cellsize).setOutlineStyle(gridcolor,0.5)
                ,
                scene.add.rectangle(
                    x, y, cellsize * gridnum , cellsize * gridnum
                ).setStrokeStyle(2,gridcolor)
                
            ]

        ).setDepth(0)
    )
}

export class GameOver_Button extends Phaser.GameObjects.Container{

    constructor(scene,x,y,text,callback){

        super(scene,x,y)

        this.button_width = 180
        this.button_height = 50
        this.font_size = 30

        this.text = scene.add.text(0,0,text,
            {fontFamily : 'eight_bit', fontSize: this.font_size, color : '#ffffff'}
        ).setAlign('center').setOrigin(0.5)

        this.box = scene.add.rectangle(0,0, this.button_width , this.button_height ,0x000000,1)
            .setStrokeStyle(2,0xffffff)

        this.add(
            [
                this.box,
                this.text
            ]  
        )

        this.setSize( this.button_width , this.button_height)
        this.setInteractive()

        this.on(
            Phaser.Input.Events.POINTER_OVER,() =>{
                this.box.setFillStyle(0xffffff)
                this.box.setStrokeStyle(0,0xffffff)
                this.text.setStyle({color : '#000000'})
            }
        )

        this.on(
            Phaser.Input.Events.POINTER_OUT,() =>{
                this.box.setFillStyle(0x000000)
                this.box.setStrokeStyle(2,0xffffff)
                this.text.setStyle({color : '#ffffff'})
            }
        )

        this.on(
            Phaser.Input.Events.POINTER_DOWN,() =>{
                callback()
            }
        )


    }

}

export class Main_MenuButton{

    constructor(scene,x,y,text,callback){

        this.button_width = 200
        this.button_height = 50

        this.triangle_select = scene.add.triangle(
            x - 30,y,
            0,0,
            20,20,
            0,40,
            0xffffff,1
        ).setVisible(false)


        this.text = scene.add.text(x,y,text,
            fontStyle(30)
        ).setOrigin(0,0.5)

        this.button = scene.add.rectangle(
            x,y,this.button_width,this.button_height
        ).setOrigin(0,0.5)

        this.button.setInteractive()

        //scene.input.enableDebug(this.button)

        this.button.on(
            Phaser.Input.Events.POINTER_OVER, () =>{
                if(scene.howtoplay_frame === undefined) this.triangle_select.setVisible(true)
            }
        )

        this.button.on(
            Phaser.Input.Events.POINTER_OUT, () =>{
                this.triangle_select.setVisible(false)
            }
        )

        this.button.on(
            Phaser.Input.Events.POINTER_DOWN, () =>{
                if(scene.howtoplay_frame === undefined) callback()
                else{ 
                    console.log(scene.howtoplay_frame)
                    console.log('cant click')
                }
            }
        )

    }

}

export class Toggle extends Phaser.GameObjects.Container{
    
    constructor(scene,x,y,text,callback){

        super(scene,x,y)

        this.toggle_text = scene.add.text(0,0,text,fontStyle(25)).setOrigin(0.5).setName('text')
            .setOrigin(0.5,0.5)

        this.toggle_bg = scene.add.rectangle(0,0,
            200,40)
            .setFillStyle(0x000000).setName('bg').setOrigin(0.5,0.5)

        this.add([
            this.toggle_bg,
            this.toggle_text
            
        ])

        this.toggle_bg.setInteractive()

        scene.input.enableDebug(this)

        this.toggle_bg.on(
            Phaser.Input.Events.POINTER_OVER, () =>{
                this.toggle_text.setStyle({ color : '#000000' })
                this.toggle_bg.setFillStyle(0xffffff)
            }    
        )

        this.toggle_bg.on(
            Phaser.Input.Events.POINTER_OUT, () =>{
                this.toggle_text.setStyle({ color : '#ffffff' })
                this.toggle_bg.setFillStyle(0x000000)
            }
        )

        this.toggle_bg.on(
            Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                if(pointer.leftButtonDown()){
                    callback()
                    this.setData()
                }

            }
        )

    }

}

export class Planning_Button extends Phaser.GameObjects.Container{
    
    constructor(scene,x,y,text,setEnable,callback,callback2){

        super(scene,x,y)

        const button_height = 50

        this.button = scene.add.rectangle(
            0,0 ,180,button_height,0x0000ff,1
        ).setDepth(0)

        this.text = scene.add.text(
            0,0,text,
            fontStyle(30)
        ).setOrigin(0.5).setDepth(1)
        
        this.setSize(this.button.width, this.button.height)

        this.enable = setEnable

        this.add(
            [
                this.button,
                this.text
            ]
        )

        this.setInteractive()

        this.on(
            Phaser.Input.Events.POINTER_OVER, () =>{
                if(this.enable === true) this.over()
                else this.disable()
            }
        )

        this.on(
            Phaser.Input.Events.POINTER_OUT, () =>{

                if(callback2 !== undefined){
                    callback2(this)
                }

                if(this.enable === true) this.out()
                else this.disable()
            }
        )

        this.on(
            Phaser.Input.Events.POINTER_DOWN, () =>{
                if(this.enable === true) callback()
            }
        )

        if(setEnable === false) this.disable()

    }

    over(){
        this.button.setFillStyle(0x000000)
        this.button.setStrokeStyle(2, 0xffffff)
        this.text.setStyle({ color : '#ffffff' })
    }

    out(){
        //initial design
        this.button.setFillStyle(0x0000ff)
        this.button.setStrokeStyle(0, 0xffffff)
        this.text.setStyle({ color : '#ffffff' })
    }

    disable(){
        this.button.setFillStyle(0x808080)
        this.button.setStrokeStyle(0, 0xffffff)
        this.text.setStyle({ color : '#000000' })
    }
}

export class Shipbutton extends Phaser.GameObjects.Container{

    constructor(scene,x,y,name,rank,length){

        super(scene,x,y)

        const button_height = 50

        this.rank = rank
        this.index = rank - 1

        this.name = name

        this.is_select = false

        this.button = scene.add.rectangle(
            0,0 ,230,button_height,0x0000ff,1
        ).setDepth(0)

        this.text = scene.add.text(
            -(this.button.width / 2) + 10,0,name,
            {fontFamily : 'eight_bit', fontSize: 30, color : '#ffffff'}
        ).setOrigin(0,0.5).setDepth(1)
        
                
        this.text2 = scene.add.text(
            (this.button.width / 2) - 10,0,("| "+length) ,
            {fontFamily : 'eight_bit', fontSize: 30, color : '#ffffff'}
        ).setOrigin(1,0.5)

        this.setSize(this.button.width, this.button.height)

        this.add(
            [
                this.button,
                this.text,
                this.text2 
            ]
        )

        this.setInteractive()

        //scene.input.enableDebug(this)

        this.on(
            Phaser.Input.Events.POINTER_DOWN,() =>{
                if(scene.ship_visual_highlight[this.index].is_place === false){
                    if(scene.ship_current_data !== undefined){
                        const _SHIP = scene.ship_buttons_layer.getChildren()[scene.ship_current_data.rank - 1]
                        _SHIP.is_select = false
                        _SHIP.out()
                        
                        if(scene.ship_current_data.rank !== rank){

                            this.is_select = true
                            scene.ship_current_data = {
                                align : 1,
                                length : length,
                                rank  : rank
                            }

                            scene.ship_visual_highlight[ships.length - scene.ship_current_data.rank] = {
                                is_place : false,
                                highlight : 
                                new Phaser.Geom.Rectangle(0,0,cellsize,(ships[
                                    ships.length - scene.ship_current_data.rank
                                ] * cellsize))
                            }
                        }
                        else{
                            scene.ship_current_data = undefined
                        }
                    }
                    else{
                        this.is_select = true
                        scene.ship_current_data = {
                            align : 1,
                            length : length,
                            rank  : rank
                        }
                    }
                    scene.ship_visual_highlight[this.index] = {
                        is_place : false,
                        highlight : new Phaser.Geom.Rectangle(
                            0,0,
                            cellsize,((ships[ this.rank - 1 ]) * cellsize)
                        )
                    }
                }
                else{
                    this.over()
                    this.cancel_place(scene)
                }

                scene.graphics_.clear()

                //console.log(scene.ship_current_data)
            }
            
        )

        this.on(
            Phaser.Input.Events.POINTER_OVER,() =>{
                if(scene.ship_visual_highlight[this.index].is_place === false){
                    this.over()
                }
                else{
                    scene.ship_visual_layer.getChildren()[this.index].setTint(0x00ffff)
                }
                
            }
        )

        this.on(
            Phaser.Input.Events.POINTER_OUT,() =>{
                if(this.is_select === false) this.out()

                if(scene.ship_visual_highlight[this.index].is_place === true){
                    scene.ship_visual_layer.getChildren()[this.index].setTint(0x0000ff)
                }
            }
        )
    }

    place(){
        this.button.setFillStyle(0xffffff)
        this.button.setStrokeStyle(0, 0x000000)
        this.text.setStyle({ color : '#000000' })
        this.text2.setStyle({ color : '#000000' })
    }

    over(){
        this.button.setFillStyle(0x000000)
        this.button.setStrokeStyle(2, 0xffffff)
        this.text.setStyle({ color : '#ffffff' })
        this.text2.setStyle({ color : '#ffffff' })
    }

    out(){
        //initial design
        this.button.setFillStyle(0x0000ff)
        this.button.setStrokeStyle(0, 0xffffff)
        this.text.setStyle({ color : '#ffffff' })
        this.text2.setStyle({ color : '#ffffff' })
    }

    cancel_place(scene){

        scene.ship_visual_layer.getChildren()[this.index]
            .setVisible(false)
            .setPosition(0,0)
            .setAngle(0)
            .setTint(0x0000ff)
    
        scene.ships_placed++

        scene.ship_visual_highlight[this.index] = {
            is_place : false,
            highlight : undefined
        }
        this.is_select = false

        scene.remap_board(scene.ship_all_info[this.index],0)
        scene.ship_all_info[this.index] = undefined

        this.out()
    }

}

export class closeButton extends Phaser.GameObjects.Image{

    constructor(scene,x,y,callback){

        super(scene,x,y,"cardclose")

        this.setInteractive(
            new Phaser.Geom.Circle(20,20,20),Phaser.Geom.Circle.Contains
        )

        this.on(
            Phaser.Input.Events.POINTER_DOWN, (pointer) =>{
                if(pointer.leftButtonDown()){
                    callback()
                }
            }
        )

    }

}

export const fontStyle = (_FONTSIZE,_COLOR) =>{
    return {
        fontFamily : 'eight_bit',
        fontSize : _FONTSIZE,
        color : (_COLOR !== undefined)? _COLOR : "#ffffff"
    }
}
