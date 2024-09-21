"use client";

import React, { useEffect, useState } from "react";
import "./property-highlight.css";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import Image from "next/image";

interface IPropertyHighlight {
    id: string;
    text: string;
}

const PropertyHighlights = () => {
    const [highlights, setHighlights] = useState<IPropertyHighlight[] | null>(null);

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination || !highlights) return;

        const items = Array.from(highlights);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setHighlights(items);
    };

    async function fetchPropertyHighlights() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/property-highlights`);
        setHighlights(await res.json());
    }

    async function updatePropertyHighlights() {
        if (!highlights) return;

        const apiBody = {
            property_highlights: highlights,
        };
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/property-highlights`, {
            method: "PUT",
            body: JSON.stringify(apiBody),
            headers: { "Content-Type": "application/json" },
        });
    }

    useEffect(() => {
        fetchPropertyHighlights();
    }, []);

    useEffect(() => {
        updatePropertyHighlights();
    }, [highlights]);

    return (
        <div className="property_highlight">
            <div className="property_highlight_header">
                <h3 className="property_highlight_header_text">Property highlights</h3>
                <button
                    className="property_highlight_header_cta"
                    onClick={() => highlights &&
                        setHighlights([
                            ...highlights,
                            { id: `${Math.random() * 99999 + 1}`, text: "" },
                        ])
                    }
                >
                    + Add Highlight
                </button>
            </div>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="highlights">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {highlights?.map(({ id, text }, index) => (
                                <Draggable key={id} draggableId={id} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="property_highlight_item"
                                        >
                                            <div className="draggable_icon_container">
                                                <Image
                                                    src={"/draggable.svg"}
                                                    height={15}
                                                    width={8}
                                                    alt="Drag"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={text}
                                                onChange={(e) => {
                                                    const newHighlights = [...highlights];
                                                    newHighlights[index].text = e.target.value;
                                                    setHighlights(newHighlights);
                                                }}
                                                className="property_highlight_item_input"
                                            />
                                            <button
                                                className="property_highlight_delete"
                                                onClick={() =>
                                                    setHighlights(
                                                        highlights.filter((_, i) => i !== index)
                                                    )
                                                }
                                            >
                                                <Image
                                                    src={"/bin.svg"}
                                                    height={40}
                                                    width={40}
                                                    alt="Delete"
                                                />
                                            </button>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default PropertyHighlights;
