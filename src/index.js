import './style.css'
import game from './modules/Game'
import './modules/Controller'
import render from './modules/Render'
import bgm from './modules/Bgm'
import cheat from './modules/Cheat'
import hotkeys from './modules/Hotkeys'

window.onload = () => {
    let menuWrap = document.getElementById('menu-wrap');
    let monsterBookWrap = document.getElementById('monster-book-wrap');
    let floorWrap = document.getElementById('floor');
    let floorList = document.getElementById('floor-list');
    let control = document.getElementById('control');

    const stopPlayerInput = () => {
        game.player.isMove = false;
        game.player.turn = null;
        game.touching = false;
    }

    const resetPlayerMotion = () => {
        stopPlayerInput();
        game.player.moveTo = null;
        game.player.target = null;
        if( control ) {
            control.className = '';
        }
    }

    const saveGame = () => {
        let save = {
            player: game.player,
            maps: game.maps,
            mapIndex: game.mapIndex,
            shopTime: game.shopTime,
            floors: game.floors
        }
        localStorage.setItem('mota-save', JSON.stringify(save));
        render.msg('存档成功');
        return true;
    }

    const loadGame = () => {
        let rawSave = localStorage.getItem('mota-save');
        if( !rawSave ) {
            render.msg('暂无存档');
            return false;
        }
        try {
            let save = JSON.parse(rawSave);
            if( !save || !save.player || !save.maps || !save.mapIndex ) {
                throw new Error('invalid save');
            }
            stopPlayerInput();
            game.player.set(save.player);
            game.player.moveTo = null;
            game.player.target = null;
            game.player.isMove = false;
            game.player.turn = null;
            game.maps = save.maps;
            game.mapIndex = save.mapIndex;
            game.shopTime = save.shopTime || 1;
            game.floors = Array.isArray(save.floors) ? save.floors : [];
            game.init();
            cheat.sync();
            render.msg('读档成功');
            return true;
        } catch (err) {
            render.msg('存档损坏，无法读取');
            return false;
        }
    }

    const openMenu = () => {
        stopPlayerInput();
        menuWrap.style.transform = 'translateX(-100vw)';
        menuWrap.dataset.open = '1';
    }
    const closeMenu = () => {
        menuWrap.style.transform = 'translateX(0)';
        menuWrap.dataset.open = '0';
    }
    const isMenuOpen = () => menuWrap.dataset.open === '1';

    const openMonsterBook = () => {
        if( !game.player.items.monsterMenu ) {
            render.msg('没有获得怪物图鉴');
            return false;
        }
        stopPlayerInput();
        render.monsterList(game);
        monsterBookWrap.style.transform = 'translateY(-100%)';
        monsterBookWrap.dataset.open = '1';
        return true;
    }
    const closeMonsterBook = () => {
        monsterBookWrap.style.transform = 'translateY(0)';
        monsterBookWrap.dataset.open = '0';
    }
    const isMonsterBookOpen = () => monsterBookWrap.dataset.open === '1';

    const closeFloor = () => {
        floorWrap.style.visibility = 'hidden';
        floorList.querySelectorAll('.selected').forEach(node => {
            node.classList.remove('selected');
        });
    }
    const isFloorOpen = () => getComputedStyle(floorWrap).visibility === 'visible';

    const blinkFloor = offset => {
        if( !game.running ) {
            return false;
        }
        let targetIndex = game.mapIndex + offset;
        if( targetIndex < 1 ) {
            render.msg('已经是最底层');
            return false;
        }
        let targetMap = game.getMap(targetIndex);
        if( !targetMap ) {
            render.msg(offset > 0 ? game.getDemoFinalTip(game.getMaxFloor()) : '已经是最底层');
            return false;
        }
        let spawnKey = offset > 0 ? 'up' : 'down';
        let spawnIndex = targetMap[spawnKey];
        if( !Number.isInteger(spawnIndex) ) {
            render.msg('这一层没有可闪现的楼梯');
            return false;
        }
        resetPlayerMotion();
        game.mapIndex = targetIndex;
        game.player.set({index: spawnIndex});
        game.init();
        cheat.sync();
        if( targetIndex === game.getMaxFloor() ) {
            render.msg(game.getDemoFinalTip(targetIndex));
        } else {
            render.msg(`闪现到第${targetIndex}层`);
        }
        return true;
    }

    bgm.init();
    game.init();
    cheat.init(game);
    hotkeys.init({
        game,
        actions: {
            openMenu,
            closeMenu,
            isMenuOpen,
            openMonsterBook,
            closeMonsterBook,
            isMonsterBookOpen,
            closeFloor,
            isFloorOpen,
            useTeleport: () => {
                stopPlayerInput();
                render.chuansong(game);
            },
            openCheat: () => cheat.open(),
            closeCheat: () => cheat.close(),
            isCheatOpen: () => cheat.isOpen(),
            blinkPrevFloor: () => blinkFloor(-1),
            blinkNextFloor: () => blinkFloor(1),
            saveGame,
            loadGame,
            refreshGame: () => window.location.reload()
        }
    });

    //  开启传送
    document.getElementById('chuansong-btn').onclick = () => {
        stopPlayerInput();
        render.chuansong(game);
    }
    //  关闭
    document.getElementById('close-floor').onclick = closeFloor;
    //  打开菜单
    document.getElementById('menu-btn').onclick = openMenu;
    //  关闭菜单
    document.getElementById('close-menu').onclick = closeMenu;
    //  打开怪物图鉴
    document.getElementById('monster-book').onclick = openMonsterBook;
    //  关闭怪物图鉴
    document.getElementById('monster-book-close').onclick = closeMonsterBook;
    //  刷新
    document.getElementById('refresh').onclick = () => window.location.reload();
    //  存档
    document.getElementById('save').onclick = saveGame;
    //  读档
    document.getElementById('load').onclick = loadGame;

}
