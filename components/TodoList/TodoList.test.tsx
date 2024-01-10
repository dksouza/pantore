import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TodoList from "./";

describe("TodoList", () => {
  test("renders TodoList component", () => {
    const { getByTestId } = render(<TodoList />);
    const viewContent = getByTestId("view-content");
    expect(viewContent).toBeTruthy();
  });

  test("adds a new item to the list", () => {
    const { getByTestId, getByText } = render(<TodoList />);

    fireEvent.changeText(getByTestId("input-title"), "New Task");
    fireEvent.changeText(
      getByTestId("input-description"),
      "Description for the task",
    );

    fireEvent.press(getByTestId("btn-add-item"));

    const newItem = getByText("Título: New Task");
    expect(newItem).toBeTruthy();
  });

  test("filters completed tasks", () => {
    const { getByTestId, queryByText } = render(<TodoList />);

    fireEvent.press(getByTestId("btn-filter"));

    const filterButtonText = getByTestId("btn-filter").children[0].toString();
    if (filterButtonText !== "Listar tudo") {
      const completedItem = queryByText("Status: CONCLUÍDO");
      expect(completedItem).toBeFalsy();
    } else {
      const pendingItem = queryByText("Status: PENDENTE");
      expect(pendingItem).toBeTruthy();
    }
  });
});
