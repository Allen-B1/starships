export function createCard(back, card, idx) {
    let states = {};

    if (card.length != 1) {
        states = {
            2: {
                Name: "CardCustom",
                Transform: {
                    posX: 0,
                    posY: 0,
                    posZ: 0,
                    rotX: 0,
                    rotY: 180,
                    rotZ: 180,
                    scaleX: 1,
                    scaleY: 1,
                    scaleZ: 1
                },

                HideWhenFaceDown: true,
                DragSelectable: true,
                Autoraise: true,
                Grid: true, Snap: true, Sticky: true,
                CardID: (2*idx+1 + 10) * 100,

                CustomDeck: {
                    [(2*idx+1 + 10)]: {
                        FaceURL: card[1],
                        BackURL: back,
                        BackIsHidden: true,
                        UniqueBack: false,
                        NumWidth: 1,
                        NumHeight: 1,
                        Type: 1
                    }
                }
            }
        }
    }

    return {
        Name: "CardCustom",
        Transform: {
            posX: 0,
            posY: 0,
            posZ: 0,
            rotX: 0,
            rotY: 180,
            rotZ: 180,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1
        },

        HideWhenFaceDown: true,
        DragSelectable: true,
        Autoraise: true,
        Grid: true, Snap: true, Sticky: true,
        CardID: (2*idx + 10) * 100,

        CustomDeck: {
            [(2*idx + 10)]: {
                FaceURL: card[0],
                BackURL: back,
                BackIsHidden: true,
                UniqueBack: false,
                NumWidth: 1,
                NumHeight: 1,
                Type: 1
            }
        },

        States: states
    }
}

export function createDeck(back, cards) {
    const obj = {
        Name: "Deck",
        Transform: {
            posX: 0,
            posY: 0,
            posZ: 0,
            rotX: 0,
            rotY: 180,
            rotZ: 180,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1
        },

        Grid: true,
        Snap: true,
        DragSelectable: true,
        Autoraise: true,
        Sticky: true,
        Toolitp: true,
        HideWhenFaceDown: true,
        DeckIDs: cards.map((_, i) => (2*i + 10) * 100),
        CustomDeck: {},
        ContainedObjects: cards.map((c, i) => createCard(back, c, i))
    };

    for (let i = 0; i < cards.length; i++) {
        obj.CustomDeck[[(2*i + 10)]] = {
            FaceURL: cards[i][0],
            BackURL: back,
            BackIsHidden: true,
            UniqueBack: false,
            NumWidth: 1,
            NumHeight: 1,
            Type: 1
        };
    }

    return obj;
}

export function wrap(obj) {
    return {
        Gravity: 0.5,
        PlayArea: 0.5,
        ObjectStates: [obj]
    };
}