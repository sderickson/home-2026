import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import Sortable from "sortablejs";
import { mountWithPlugins, stubGlobals } from "@saflib/vue/testing";
import RecipeIngredientsForm from "./RecipeIngredientsForm.vue";
import type { RecipeIngredient } from "./RecipeIngredientsForm.logic.ts";
import { app_strings } from "../../strings.ts";

const ing = (name: string): RecipeIngredient => ({
  quantity: "1",
  unit: "cup",
  name,
});

function mountForm(initial: RecipeIngredient[]) {
  let model = initial;
  const wrapper = mountWithPlugins(
    RecipeIngredientsForm,
    {
      props: {
        modelValue: model,
        "onUpdate:modelValue": (value: RecipeIngredient[]) => {
          model = value;
          void wrapper.setProps({ modelValue: value });
        },
      },
    },
    { i18nMessages: { ...app_strings } },
  );
  return { wrapper, getModel: () => model };
}

/** Ingredient names in the order the rows appear on screen. */
function renderedNames(wrapper: ReturnType<typeof mountForm>["wrapper"]) {
  return wrapper
    .findAll("tr.ingredient-row")
    .map((row) => row.findAll("td").at(-1)!.text());
}

/**
 * Do what Sortable does for a drag: `onStart`, move the row element in the
 * DOM, then `onEnd` with the element indices.
 */
async function simulateDrag(
  wrapper: ReturnType<typeof mountForm>["wrapper"],
  oldIndex: number,
  newIndex: number,
) {
  const tbody = wrapper.find("tbody").element as HTMLElement;
  const rows = Array.from(tbody.querySelectorAll("tr.ingredient-row"));
  const item = rows[oldIndex]!;
  const target = rows[newIndex]!;
  const sortable = Sortable.get(tbody)!;
  sortable.options.onStart!({
    oldIndex,
    item,
    from: tbody,
  } as unknown as Sortable.SortableEvent);
  tbody.insertBefore(
    item,
    newIndex > oldIndex ? target.nextElementSibling : target,
  );
  sortable.options.onEnd!({
    oldIndex,
    newIndex,
    item,
    from: tbody,
    to: tbody,
  } as unknown as Sortable.SortableEvent);
  await nextTick();
}

async function addIngredient(
  wrapper: ReturnType<typeof mountForm>["wrapper"],
  line: string,
) {
  const input = wrapper.find("tr.new-row input");
  await input.setValue(line);
  await input.trigger("keydown", { key: "Enter" });
  await nextTick();
}

describe("RecipeIngredientsForm drag and drop", () => {
  stubGlobals();

  it("keeps rows in list order after dragging the last row up and adding more", async () => {
    const { wrapper, getModel } = mountForm([ing("a"), ing("b"), ing("c")]);

    await simulateDrag(wrapper, 2, 0);
    expect(getModel().map((i) => i.name)).toEqual(["c", "a", "b"]);
    expect(renderedNames(wrapper)).toEqual(["c", "a", "b"]);

    await addIngredient(wrapper, "1 cup d");
    expect(getModel().map((i) => i.name)).toEqual(["c", "a", "b", "d"]);
    expect(renderedNames(wrapper)).toEqual(["c", "a", "b", "d"]);
    wrapper.unmount();
  });

  it("keeps rows in list order after dragging the first row down and adding more", async () => {
    const { wrapper, getModel } = mountForm([ing("a"), ing("b"), ing("c")]);

    await simulateDrag(wrapper, 0, 2);
    await addIngredient(wrapper, "1 cup d");
    expect(getModel().map((i) => i.name)).toEqual(["b", "c", "a", "d"]);
    expect(renderedNames(wrapper)).toEqual(["b", "c", "a", "d"]);
    wrapper.unmount();
  });
});
